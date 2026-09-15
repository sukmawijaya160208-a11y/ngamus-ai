import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import chatRoutes from './routes/chat.js';
import toolRoutes from './routes/tools.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'Ngampus AI',
    version: '1.0.0',
    geminiReady: !!process.env.GEMINI_API_KEY,
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/tools', toolRoutes);

app.listen(PORT, () => {
  console.log(`\n  Ngampus AI Server berjalan di http://localhost:${PORT}\n`);
});
