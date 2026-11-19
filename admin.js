const SUPABASE_URL = 'https://zflmggxwprkidswowmfv.supabase.co'; // <-- GANTI INI
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbG1nZ3h3cHJraWRzd293bWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5OTAyOTQsImV4cCI6MjExMDU2NjI5NH0.rkl7wfIxBjIFznafCg1S_6Ir65ZwLZZIp2DI2MUWMaA';    // <-- GANTI INI

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

db.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    loadAdminList();
  }
});

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) { document.getElementById('loginMsg').innerHTML = `<p style="color:red">${error.message}</p>`; return; }
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('adminSection').classList.remove('hidden');
  loadAdminList();
}

async function logout() {
  await db.auth.signOut();
  location.reload();
}

async function tambahNomor() {
  const negara = document.getElementById('inputNegara').value;
  const nomor = document.getElementById('inputNomor').value.trim();
  const harga = parseInt(document.getElementById('inputHarga').value);
  
  if (!nomor || !harga) return alert("Isi semua data!");

  await db.from('nomor').insert([{ negara, nomor, harga }]);
  document.getElementById('inputNomor').value = '';
  document.getElementById('inputHarga').value = '';
  loadAdminList();
}

async function loadAdminList() {
  const container = document.getElementById('adminList');
  const { data } = await db.from('nomor').select('*').order('created_at', { ascending: false });
  
  if (!data) return;
  container.innerHTML = data.map(d => `
    <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #334155;">
      <div><b>${d.nomor}</b><br><small>${d.negara} - ${d.status}</small></div>
      <button class="btn btn-danger" onclick="hapusNomor(${d.id})">Hapus</button>
    </div>
  `).join('');
}

async function hapusNomor(id) {
  if(confirm('Hapus nomor ini?')) {
    await db.from('nomor').delete().eq('id', id);
    loadAdminList();
  }
}