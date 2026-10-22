const WA = "62895332059125"; // ganti dengan nomor WhatsApp Anda
const rp = n => "Rp " + n.toLocaleString("id-ID");

const MENU = [
  {id:1,nama:"Nasi Goreng Spesial",kat:"Makanan Utama",harga:25000,emoji:"🍛",desc:"Nasi goreng dengan telur, ayam suwir, dan kerupuk."},
  {id:2,nama:"Rendang Sapi",kat:"Makanan Utama",harga:38000,emoji:"🥘",desc:"Daging sapi empuk dimasak dengan bumbu rempah khas Padang."},
  {id:3,nama:"Ayam Bakar Madu",kat:"Makanan Utama",harga:30000,emoji:"🍗",desc:"Ayam bakar dengan olesan madu, lalapan, dan sambal."},
  {id:4,nama:"Soto Ayam",kat:"Makanan Utama",harga:22000,emoji:"🍲",desc:"Soto kuah kuning hangat dengan bihun dan telur."},
  {id:5,nama:"Gado-Gado",kat:"Sayur",harga:20000,emoji:"🥗",desc:"Sayuran segar dengan saus kacang gurih."},
  {id:6,nama:"Sayur Asem",kat:"Sayur",harga:15000,emoji:"🥬",desc:"Sayur kuah asam segar dengan jagung dan kacang panjang."},
  {id:7,nama:"Sate Ayam (10 tusuk)",kat:"Camilan",harga:28000,emoji:"🍢",desc:"Sate ayam bumbu kacang dengan lontong."},
  {id:8,nama:"Risoles Ragout",kat:"Camilan",harga:5000,emoji:"🥟",desc:"Risoles isi ragout ayam dan sayuran."},
  {id:9,nama:"Lemper Ayam",kat:"Camilan",harga:5000,emoji:"🍙",desc:"Ketan isi ayam suwir dibungkus daun pisang."},
  {id:10,nama:"Es Teh Manis",kat:"Minuman",harga:6000,emoji:"🧋",desc:"Teh manis dingin menyegarkan."},
  {id:11,nama:"Es Jeruk",kat:"Minuman",harga:9000,emoji:"🍹",desc:"Perasan jeruk segar dengan es batu."},
  {id:12,nama:"Es Cendol",kat:"Dessert",harga:12000,emoji:"🍧",desc:"Cendol, santan, dan gula merah."},
  {id:13,nama:"Pudding Cokelat",kat:"Dessert",harga:10000,emoji:"🍮",desc:"Pudding lembut dengan vla vanila."},
  {id:14,nama:"Bakso Urat",kat:"Makanan Utama",harga:24000,emoji:"🍜",desc:"Bakso urat kenyal dengan mie dan kuah kaldu sapi."}
];

const PAKET = [
  {id:"p1",nama:"Paket Hemat",harga:25000,min:20,pop:false,isi:["Nasi putih","Ayam goreng/bakar","Sayur tumis","Sambal & kerupuk","Air mineral"]},
  {id:"p2",nama:"Paket Reguler",harga:38000,min:30,pop:true,isi:["Nasi putih","Ayam/daging pilihan","2 jenis sayur","Gorengan & sambal","Buah potong","Air mineral"]},
  {id:"p3",nama:"Paket Premium",harga:55000,min:50,pop:false,isi:["Nasi putih/liwet","Rendang atau ayam bakar madu","3 jenis lauk","Sayur & lalapan","Dessert pilihan","Es teh/jus"]},
  {id:"p4",nama:"Paket Snack Box",harga:18000,min:30,pop:false,isi:["2 kue basah","1 gorengan","Buah potong","Air mineral"]}
];

let cart = {};   // {id: qty}
let activeCat = "Semua";

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");
  document.getElementById(t.dataset.tab).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}));

/* ---------- Menu ---------- */
function renderChips(){
  const cats = ["Semua",...new Set(MENU.map(m=>m.kat))];
  const el = document.getElementById("chips");
  el.innerHTML = cats.map(c=>`<button class="chip ${c===activeCat?"active":""}" data-c="${c}">${c}</button>`).join("");
  el.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{activeCat=b.dataset.c;renderChips();renderMenu();});
}
function renderMenu(){
  const q = document.getElementById("search").value.toLowerCase().trim();
  const list = MENU.filter(m=>(activeCat==="Semua"||m.kat===activeCat)&&(m.nama.toLowerCase().includes(q)||m.desc.toLowerCase().includes(q)));
  document.getElementById("menuGrid").innerHTML = list.map(m=>`
    <article class="card">
      <div class="emoji">${m.emoji}</div>
      <div class="body">
        <span class="cat">${m.kat}</span>
        <h3>${m.nama}</h3>
        <p>${m.desc}</p>
        <div class="row"><span class="price">${rp(m.harga)}</span>
        <button class="btn" onclick="addCart(${m.id})">+ Tambah</button></div>
      </div>
    </article>`).join("");
  document.getElementById("empty").style.display = list.length?"none":"block";
}
document.getElementById("search").addEventListener("input",renderMenu);

/* ---------- Katering ---------- */
function renderPaket(){
  document.getElementById("paketGrid").innerHTML = PAKET.map(p=>`
    <div class="paket ${p.pop?"pop":""}">
      ${p.pop?'<span class="tag">Terlaris</span>':""}
      <h3>${p.nama}</h3>
      <div class="harga">${rp(p.harga)}</div><small>per porsi · min. ${p.min} porsi</small>
      <ul>${p.isi.map(i=>`<li>${i}</li>`).join("")}</ul>
      <button class="btn ${p.pop?"":"ghost"}" onclick="pilihPaket('${p.id}')">Pilih Paket</button>
    </div>`).join("");
  document.getElementById("paketSelect").innerHTML = PAKET.map(p=>`<option value="${p.id}">${p.nama} – ${rp(p.harga)}</option>`).join("");
  hitungEstimasi();
}
function pilihPaket(id){
  document.getElementById("paketSelect").value = id;
  const p = PAKET.find(x=>x.id===id);
  const porsi = document.getElementById("porsi");
  if(+porsi.value < p.min) porsi.value = p.min;
  hitungEstimasi();
  document.getElementById("orderForm").scrollIntoView({behavior:"smooth"});
}
function hitungEstimasi(){
  const p = PAKET.find(x=>x.id===document.getElementById("paketSelect").value);
  const n = +document.getElementById("porsi").value||0;
  document.getElementById("estimasi").textContent = rp((p?p.harga:0)*n);
}
document.getElementById("paketSelect").addEventListener("change",hitungEstimasi);
document.getElementById("porsi").addEventListener("input",hitungEstimasi);
document.getElementById("orderForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const p = PAKET.find(x=>x.id===f.get("paket"));
  const n = +f.get("porsi");
  if(n < p.min){ toast(`Minimal ${p.min} porsi untuk ${p.nama}`); return; }
  const msg = `*Pesanan Katering*%0A`+
    `Nama: ${f.get("nama")}%0AHP: ${f.get("hp")}%0A`+
    `Paket: ${p.nama} (${rp(p.harga)})%0APorsi: ${n}%0A`+
    `Tanggal: ${f.get("tgl")}%0AAlamat: ${f.get("alamat")}%0A`+
    `Catatan: ${f.get("catatan")||"-"}%0A*Estimasi: ${rp(p.harga*n)}*`;
  window.open(`https://wa.me/${WA}?text=${msg}`,"_blank");
});

/* ---------- Keranjang ---------- */
function addCart(id){ cart[id]=(cart[id]||0)+1; updateCart(); toast("Ditambahkan ke keranjang"); }
function changeQty(id,d){ cart[id]=(cart[id]||0)+d; if(cart[id]<=0) delete cart[id]; updateCart(); }
function updateCart(){
  const ids = Object.keys(cart);
  const count = ids.reduce((s,i)=>s+cart[i],0);
  const total = ids.reduce((s,i)=>s+cart[i]*MENU.find(m=>m.id==i).harga,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = rp(total);
  document.getElementById("cartItems").innerHTML = ids.length ? ids.map(i=>{
    const m = MENU.find(x=>x.id==i);
    return `<div class="item"><span style="font-size:1.8rem">${m.emoji}</span>
      <div class="info"><b>${m.nama}</b><span>${rp(m.harga)}</span></div>
      <div class="qty"><button onclick="changeQty(${m.id},-1)">−</button><b>${cart[i]}</b><button onclick="changeQty(${m.id},1)">+</button></div></div>`;
  }).join("") : '<div class="empty">Keranjang masih kosong</div>';
}
const drawer = document.getElementById("drawer"), overlay = document.getElementById("overlay");
function openCart(o){ drawer.classList.toggle("show",o); overlay.classList.toggle("show",o); }
document.getElementById("cartBtn").onclick = ()=>openCart(true);
document.getElementById("closeCart").onclick = ()=>openCart(false);
overlay.onclick = ()=>openCart(false);
document.getElementById("checkout").onclick = ()=>{
  const ids = Object.keys(cart);
  if(!ids.length){ toast("Keranjang kosong"); return; }
  let total = 0;
  const lines = ids.map(i=>{ const m=MENU.find(x=>x.id==i); total+=m.harga*cart[i]; return `- ${m.nama} x${cart[i]} = ${rp(m.harga*cart[i])}`; });
  const msg = encodeURIComponent(`*Pesanan Menu*\n${lines.join("\n")}\n*Total: ${rp(total)}*`);
  window.open(`https://wa.me/${WA}?text=${msg}`,"_blank");
};

/* ---------- Toast ---------- */
let tt;
function toast(t){ const el=document.getElementById("toast"); el.textContent=t; el.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>el.classList.remove("show"),1800); }

/* Init */
renderChips(); renderMenu(); renderPaket(); updateCart();