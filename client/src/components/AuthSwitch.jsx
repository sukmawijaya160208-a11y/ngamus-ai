/* Kartu auth dua sisi dengan panel lingkaran geser.
   Perilaku animasi meniru referensi auth-switch 21st.dev,
   visual disesuaikan ke tema Ngampus AI (amber + CSS vars + lucide).
   Presentational: seluruh logika form dipegang halaman Auth.jsx
   lewat slot masukForm / daftarForm. */
export default function AuthSwitch({ mode, onSwitch, masukForm, daftarForm }) {
  const isDaftar = mode === 'daftar';

  return (
    <div className={`asw-root${isDaftar ? ' asw-signup' : ''}`}>
      <div className="asw-forms">
        <div className="asw-slide">
          <div className="asw-pane asw-pane-masuk" aria-hidden={isDaftar} inert={isDaftar}>
            {masukForm}
          </div>
          <div className="asw-pane asw-pane-daftar" aria-hidden={!isDaftar} inert={!isDaftar}>
            {daftarForm}
          </div>
        </div>
      </div>

      <div className="asw-panels">
        <div className="asw-panel asw-left">
          <div className="asw-content">
            <h3>Baru di sini?</h3>
            <p>Gabung Ngampus AI dan pakai semua tool belajar dalam satu akun gratis.</p>
            <button type="button" className="asw-btn asw-ghost" onClick={() => onSwitch('daftar')}>
              Daftar
            </button>
          </div>
        </div>
        <div className="asw-panel asw-right">
          <div className="asw-content">
            <h3>Sudah punya akun?</h3>
            <p>Selamat datang kembali! Masuk untuk lanjut belajar.</p>
            <button type="button" className="asw-btn asw-ghost" onClick={() => onSwitch('masuk')}>
              Masuk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
