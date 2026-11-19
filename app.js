const SUPABASE_URL = 'https://zflmggxwprkidswowmfv.supabase.co'; // <-- GANTI INI
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbG1nZ3h3cHJraWRzd293bWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5OTAyOTQsImV4cCI6MjExMDU2NjI5NH0.rkl7wfIxBjIFznafCg1S_6Ir65ZwLZZIp2DI2MUWMaA';    // <-- GANTI INI

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadData() {
  const grid = document.getElementById('grid');
  const { data, error } = await db.from('nomor').select('*').eq('status', 'tersedia').order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    grid.innerHTML = '<p class="loading">Belum ada stok.</p>';
    return;
  }
  
  // Simpan data ke variabel global untuk Gacha
  window.stokNomor = data;

  grid.innerHTML = data.map(d => `
    <div class="card">
      <div class="negara">${d.negara}</div>
      <div class="nomor">${d.nomor}</div>
      <div class="harga">Rp ${Number(d.harga).toLocaleString('id-ID')}</div>
    </div>
  `).join('');
}

async function tarikGacha() {
  const btn = document.getElementById('btnGacha');
  const slot = document.getElementById('slot');
  const status = document.getElementById('gachaStatus');

  if (!window.stokNomor || window.stokNomor.length === 0) {
    alert("Stok nomor habis! Coba lagi nanti.");
    return;
  }

  btn.disabled = true;
  status.innerText = "";
  
  // Animasi muter
  let counter = 0;
  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * window.stokNomor.length);
    slot.innerText = window.stokNomor[randomIndex].nomor;
    counter++;
  }, 100);

  // Berhenti setelah 3 detik
  setTimeout(async () => {
    clearInterval(interval);
    const pemenangIndex = Math.floor(Math.random() * window.stokNomor.length);
    const pemenang = window.stokNomor[pemenangIndex];
    
    slot.innerText = pemenang.nomor;
    slot.style.color = "#10b981";
    
    // Ubah status di database jadi 'terjual'
    await db.from('nomor').update({ status: 'terjual' }).eq('id', pemenang.id);
    
    status.innerText = `🎉 Selamat! Kamu dapat nomor ${pemenang.negara} (${pemenang.nomor})`;
    btn.disabled = false;
    
    // Refresh list
    loadData();
  }, 3000);
}

loadData();