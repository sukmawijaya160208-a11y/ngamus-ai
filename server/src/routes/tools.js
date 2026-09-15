import { Router } from 'express';
import { ai, MODEL, MODEL_FALLBACKS, SYSTEM_INSTRUCTION, isRetryable, isModelGone, sleep } from '../gemini.js';

const router = Router();

async function generate(prompt, systemOverride) {
  const tried = [];
  for (const model of [...new Set([MODEL, ...MODEL_FALLBACKS])]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemOverride || SYSTEM_INSTRUCTION,
            temperature: 0.55,
            maxOutputTokens: 2048,
          },
        });
        if (!response.text) throw new Error('Empty response from ' + model);
        return response.text;
      } catch (e) {
        tried.push(`${model}: ${String(e.message || e).slice(0, 80)}`);
        if (isModelGone(e)) break;
        if (!isRetryable(e)) throw e;
        await sleep(180 * (attempt + 1));
      }
    }
  }
  throw new Error('Semua model sibuk. Coba lagi sebentar. [' + tried.join(' | ') + ']');
}

async function streamGenerate(prompt, systemOverride, onText) {
  for (const model of [...new Set([MODEL, ...MODEL_FALLBACKS])]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemOverride || SYSTEM_INSTRUCTION,
            temperature: 0.55,
            maxOutputTokens: 2048,
          },
        });
        let got = false;
        for await (const chunk of stream) {
          const t = chunk.text;
          if (t) { got = true; onText(t); }
        }
        if (!got) throw new Error('Empty stream');
        return;
      } catch (e) {
        if (isModelGone(e)) break;
        if (!isRetryable(e)) throw e;
        await sleep(180 * (attempt + 1));
      }
    }
  }
  throw new Error('Semua model sibuk.');
}

// POST /api/tools/summarize
// Body: { text, style?: 'brief' | 'detailed' | 'bullets', stream?: boolean }
router.post('/summarize', async (req, res) => {
  try {
    const { text, style = 'bullets', stream = false } = req.body;
    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'Teks terlalu pendek. Minimal 20 karakter.' });
    }
    const styleMap = {
      brief: 'Buat rangkuman singkat 1-2 paragraf yang menangkap inti teks.',
      detailed: 'Buat rangkuman detail dengan struktur: Ringkasan Utama, Poin Kunci, Detail Teknis.',
      bullets: 'Buat rangkuman dalam bentuk bullet points yang terstruktur per topik.',
    };
    const prompt = `Rangkum teks berikut. ${styleMap[style] || styleMap.bullets}

Teks:
"""
${text.slice(0, 30000)}"""`;
    const sys = `${SYSTEM_INSTRUCTION}\n\nKhusus untuk rangkuman: markdown rapi.`;
    if (stream) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.flushHeaders?.();
      let full = '';
      await streamGenerate(prompt, sys, (t) => { full += t; res.write(`data: ${JSON.stringify({ type: 'chunk', text: t })}\n\n`); });
      res.write(`data: ${JSON.stringify({ type: 'done', full })}\n\n`); res.end(); return;
    }
    const result = await generate(prompt, sys);
    res.json({ result });
  } catch (error) {
    console.error('[summarize]', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Gagal generate rangkuman.', detail: error.message });
    else { res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`); res.end(); }
  }
});

// POST /api/tools/paraphrase
// Body: { text, tone?: 'akademis' | 'santai' | 'formal', intensity?: 'ringan' | 'sedang' | 'agresif' }
router.post('/paraphrase', async (req, res) => {
  try {
    const { text, tone = 'akademis', intensity = 'sedang' } = req.body;
    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'Teks terlalu pendek.' });
    }

    const intensityMap = {
      ringan: 'Ubah sekitar 30% kata. Pertahankan struktur kalimat sebagian besar.',
      sedang: 'Ubah sekitar 60% kata dan restrukturisasi kalimat. Pertahankan makna.',
      agresif: 'Tulis ulang total dengan struktur dan diksi yang sangat berbeda. Makna harus sama persis.',
    };

    const toneMap = {
      akademis: 'Gaya bahasa akademis formal (untuk tugas kuliah).',
      santai: 'Gaya bahasa santai tapi tetap jelas (untuk catatan pribadi).',
      formal: 'Gaya bahasa formal non-akademis (untuk laporan profesional).',
    };

    const prompt = `Parafrase teks berikut.
Tone: ${toneMap[tone]}
Intensitas: ${intensityMap[intensity]}

PENTING:
- Pertahankan makna asli 100%
- Jangan tambah informasi baru
- Jangan hilangkan informasi penting
- Hasil harus terbaca natural seperti tulisan manusia, bukan output AI
- Variasikan panjang kalimat (campuran pendek dan panjang)

Teks asli:
"""
${text.slice(0, 15000)}"""`;

    const result = await generate(prompt, 'Kamu asisten parafrase profesional. Output hanya teks hasil parafrase tanpa komentar tambahan.');
    res.json({ result: result.trim() });
  } catch (error) {
    console.error('[paraphrase]', error.message);
    res.status(500).json({ error: 'Gagal parafrase.', detail: error.message });
  }
});

// POST /api/tools/citation
// Body: { type: 'apa'|'ieee'|'harvard'|'mla', source: { authors, title, year, journal, volume, issue, pages, url, publisher, city } }
router.post('/citation', async (req, res) => {
  try {
    const { type = 'apa', source } = req.body;
    if (!source) {
      return res.status(400).json({ error: 'Data sumber wajib diisi.' });
    }

    const prompt = `Buat sitasi gaya ${type.toUpperCase()} untuk sumber berikut. Output HANYA sitasi yang sudah diformat, tanpa penjelasan.

Format referensi jika ada field yang kosong, tetap buat sebaik mungkin.

Data sumber:
${JSON.stringify(source, null, 2)}`;

    const result = await generate(prompt, 'Kamu generator sitasi akademik. Output hanya sitasi terformat, tidak ada teks lain.');
    res.json({ result: result.trim() });
  } catch (error) {
    console.error('[citation]', error.message);
    res.status(500).json({ error: 'Gagal generate sitasi.', detail: error.message });
  }
});

// POST /api/tools/flashcards
// Body: { text, count?: number }
router.post('/flashcards', async (req, res) => {
  try {
    const { text, count = 10 } = req.body;
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Teks terlalu pendek untuk dijadikan flashcards.' });
    }

    const prompt = `Buat ${count} flashcard dari teks berikut. Setiap flashcard punya pertanyaan (front) dan jawaban (back).

Format output sebagai JSON array:
[{"front": "pertanyaan di sini", "back": "jawaban di sini"}]

Aturan:
- Pertanyaan harus spesifik dan bisa dijawab singkat
- Jawaban padat, maksimal 2-3 kalimat
- Cover poin-poin paling penting dari teks
- Jangan ulang pertanyaan yang mirip

Teks:
"""
${text.slice(0, 20000)}"""`;

    const result = await generate(prompt, 'Output HANYA JSON array valid. Tidak ada markdown code fence, tidak ada teks penjelas.');
    
    // Clean up potential markdown fences
    let cleaned = result.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    const cards = JSON.parse(cleaned);
    res.json({ cards });
  } catch (error) {
    console.error('[flashcards]', error.message);
    res.status(500).json({ error: 'Gagal generate flashcards.', detail: error.message });
  }
});

// POST /api/tools/quiz
// Body: { text, count?: number }
router.post('/quiz', async (req, res) => {
  try {
    const { text, count = 5 } = req.body;
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Teks terlalu pendek untuk dijadikan quiz.' });
    }

    const prompt = `Buat ${count} soal pilihan ganda dari teks berikut. Setiap soal punya 4 opsi (A, B, C, D) dan satu jawaban benar.

Format output sebagai JSON array:
[{"question": "soal di sini", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "penjelasan singkat kenapa jawabannya benar"}]

Catatan: "answer" adalah index (0-3) dari option yang benar.

Aturan:
- Soal menguji pemahaman, bukan hafalan buta
- Distractor (opsi salah) harus plausible
- Explanation wajib ada

Teks:
"""
${text.slice(0, 20000)}"""`;

    const result = await generate(prompt, 'Output HANYA JSON array valid. Tidak ada markdown code fence, tidak ada teks penjelas.');
    
    let cleaned = result.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    const quiz = JSON.parse(cleaned);
    res.json({ quiz });
  } catch (error) {
    console.error('[quiz]', error.message);
    res.status(500).json({ error: 'Gagal generate quiz.', detail: error.message });
  }
});

// POST /api/tools/explain
// Body: { text, topic }
// Penjelasan mendalam untuk topik tertentu
router.post('/explain', async (req, res) => {
  try {
    const { text, topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topik wajib diisi.' });
    }

    const context = text ? `\n\nKonteks materi:\n"""\n${text.slice(0, 15000)}\n"""` : '';
    const prompt = `Jelaskan topik berikut dengan mendalam untuk mahasiswa.${context}

Topik: ${topic}`;

    const result = await generate(prompt);
    res.json({ result });
  } catch (error) {
    console.error('[explain]', error.message);
    res.status(500).json({ error: 'Gagal generate penjelasan.', detail: error.message });
  }
});

export default router;
