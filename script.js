// ---- Auth link state ----
function setAuthLink(){
  const link = document.getElementById('authLink');
  if(!link) return;
  const user = JSON.parse(localStorage.getItem('user')||"null");
  if(user){
    link.textContent = user.name;
    link.href = '#';
    link.onclick = (e)=>{ e.preventDefault(); localStorage.removeItem('user'); location.href='/'; };
    const nameField = document.getElementById('bName');
    const emailField = document.getElementById('bEmail');
    if(nameField) nameField.value = user.name;
    if(emailField) emailField.value = user.email;
  }else{
    link.textContent = 'Login';
    link.href = '/login.html';
  }
}
setAuthLink();

async function postJson(url, payload){
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  return res.json();
}

// ---- Register ----
const registerForm = document.getElementById('registerForm');
if(registerForm){
  registerForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(registerForm));
    if(data.password !== data.confirm){ alert('รหัสผ่านไม่ตรงกัน'); return; }
    const out = await postJson('/api/register', { name:data.name, email:data.email, password:data.password });
    if(out.error){ alert(out.error); return; }
    alert('สมัครสมาชิกสำเร็จ! ไปเข้าสู่ระบบได้เลย');
    location.href = '/login.html';
  });
}

// ---- Login ----
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm));
    const out = await postJson('/api/login', data);
    if(out.error){ alert(out.error); return; }
    localStorage.setItem('user', JSON.stringify({ name: out.name, email: out.email }));
    location.href = '/';
  });
}

// ---- Booking ---- (require login)
const bookingForm = document.getElementById('bookingForm');
if(bookingForm){
  bookingForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user')||"null");
    if(!user){ alert('กรุณาเข้าสู่ระบบก่อนจอง'); location.href='/login.html'; return; }
    const data = Object.fromEntries(new FormData(bookingForm));
    const payload = { ...data, name: user.name, email: user.email };
    const out = await postJson('/api/book', payload);
    if(out.error){ alert(out.error); return; }
    alert('จองสำเร็จ!');
    location.href = '/mybooking.html';
  });
}

// ---- My Bookings ----
const fetchBtn = document.getElementById('fetchMyBookings');
if(fetchBtn){
  fetchBtn.addEventListener('click', async ()=>{
    const user = JSON.parse(localStorage.getItem('user')||"null");
    const email = user?.email || document.getElementById('emailLookup').value;
    if(!email){ alert('กรุณาใส่อีเมล'); return; }
    const rows = await postJson('/api/mybookings', { email });
    const mount = document.getElementById('bookingTable');
    if(!rows.length){ mount.innerHTML = '<p class="muted">ยังไม่มีการจอง</p>'; return; }
    mount.innerHTML = `<table><thead><tr><th>รุ่นกล้อง</th><th>วันที่จอง</th><th>สถานะ</th><th>หมายเหตุ</th></tr></thead><tbody>${
      rows.map(r=>`<tr><td>${r.camera}</td><td>${r.date}</td><td>${r.status}</td><td>${r.note||""}</td></tr>`).join("")
    }</tbody></table>`;
  });
}
