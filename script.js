const SUPABASE_URL = "https://yzxrolyplklolazvnmdd.supabase.co";
const SUPABASE_KEY = "sb_publishable_s9_ErYC4eOWz6h8LS8kzug_NKaBKMWI"; // kunci publishable, aman di frontend
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let data = {books:[],suppliers:[],customers:[],sales:[]};
let editing = null;
const $ = id => document.getElementById(id);
const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=Number;
const fromDb={
 suppliers:r=>({id:r.id,name:r.name,contact:r.contact,phone:r.phone,address:r.address}),
 customers:r=>({id:r.id,name:r.name,phone:r.phone,email:r.email||"",address:r.address}),
 books:r=>({id:r.id,isbn:r.isbn,title:r.title,author:r.author,supplierId:r.supplier_id,price:num(r.price),stock:r.stock}),
 sales:r=>({id:r.id,number:r.number,date:r.sale_date,customerId:r.customer_id,bookId:r.book_id,qty:r.qty,unitPrice:num(r.unit_price),total:num(r.total)})
};
const toDb={
 suppliers:i=>({name:i.name,contact:i.contact,phone:i.phone,address:i.address}),
 customers:i=>({name:i.name,phone:i.phone,email:i.email||"-",address:i.address}),
 books:i=>({isbn:i.isbn,title:i.title,author:i.author,supplier_id:i.supplierId,price:i.price,stock:i.stock}),
 sales:i=>({customer_id:i.customerId,book_id:i.bookId,qty:i.qty,sale_date:i.date})
};
async function loadData(){
 const order={suppliers:"id",customers:"id",books:"id",sales:"id"};
 const res=await Promise.all(Object.keys(order).map(t=>db.from(t).select("*").order(order[t])));
 const err=res.find(r=>r.error);
 if(err){showToast("Gagal memuat data: "+err.error.message);return}
 Object.keys(order).forEach((t,i)=>data[t]=res[i].data.map(fromDb[t]));
 renderAll();
}
function nextId(list){return list.reduce((m,x)=>Math.max(m,Number(x.id)||0),0)+1}
function supplierName(id){return data.suppliers.find(x=>x.id===Number(id))?.name||"Supplier dihapus"}
function customerName(id){return data.customers.find(x=>x.id===Number(id))?.name||"Pelanggan dihapus"}
function bookName(id){return data.books.find(x=>x.id===Number(id))?.title||"Buku dihapus"}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2400)}
function emptyRow(cols,msg){return `<tr><td colspan="${cols}" class="empty">${msg}</td></tr>`}
function renderStats(){
  $("statBooks").textContent=data.books.length;
  $("statStock").textContent=data.books.reduce((n,b)=>n+Number(b.stock),0);
  $("statSales").textContent=data.sales.length;
  $("statRevenue").textContent=rupiah(data.sales.reduce((n,s)=>n+Number(s.total),0));
}
function renderBooks(){
 const q=$("bookSearch").value.toLowerCase();
 const rows=data.books.filter(b=>[b.title,b.author,b.isbn].join(" ").toLowerCase().includes(q));
 $("booksBody").innerHTML=rows.map(b=>`<tr><td>${esc(b.isbn)}</td><td><span class="book-title">${esc(b.title)}</span><span class="subtext">ID Buku: ${b.id}</span></td><td>${esc(b.author)}</td><td>${esc(supplierName(b.supplierId))}</td><td>${rupiah(b.price)}</td><td><span class="stock-badge ${b.stock<5?"low":""}">${b.stock} eks.</span></td><td><button class="action-btn" data-action="edit" data-type="books" data-id="${b.id}">Edit</button><button class="action-btn delete" data-action="delete" data-type="books" data-id="${b.id}">Hapus</button></td></tr>`).join("")||emptyRow(7,"Belum ada data buku yang cocok.");
}
function renderSuppliers(){
 const q=$("supplierSearch").value.toLowerCase();
 const rows=data.suppliers.filter(s=>[s.name,s.contact,s.phone,s.address].join(" ").toLowerCase().includes(q));
 $("suppliersBody").innerHTML=rows.map(s=>`<tr><td><span class="book-title">${esc(s.name)}</span><span class="subtext">ID Supplier: ${s.id}</span></td><td>${esc(s.contact)}</td><td>${esc(s.phone)}</td><td>${esc(s.address)}</td><td><button class="action-btn" data-action="edit" data-type="suppliers" data-id="${s.id}">Edit</button><button class="action-btn delete" data-action="delete" data-type="suppliers" data-id="${s.id}">Hapus</button></td></tr>`).join("")||emptyRow(5,"Belum ada data supplier.");
}
function renderCustomers(){
 const q=$("customerSearch").value.toLowerCase();
 const rows=data.customers.filter(c=>[c.name,c.phone,c.email,c.address].join(" ").toLowerCase().includes(q));
 $("customersBody").innerHTML=rows.map(c=>`<tr><td><span class="book-title">${esc(c.name)}</span><span class="subtext">ID Pelanggan: ${c.id}</span></td><td>${esc(c.phone)}</td><td>${esc(c.email)}</td><td>${esc(c.address)}</td><td><button class="action-btn" data-action="edit" data-type="customers" data-id="${c.id}">Edit</button><button class="action-btn delete" data-action="delete" data-type="customers" data-id="${c.id}">Hapus</button></td></tr>`).join("")||emptyRow(5,"Belum ada data pelanggan.");
}
function renderSales(){
 const q=$("salesSearch").value.toLowerCase();
 const rows=data.sales.filter(s=>[s.number,customerName(s.customerId),bookName(s.bookId),s.date].join(" ").toLowerCase().includes(q));
 $("salesBody").innerHTML=rows.slice().reverse().map(s=>`<tr><td><span class="book-title">${esc(s.number)}</span></td><td>${esc(s.date)}</td><td>${esc(customerName(s.customerId))}</td><td>${esc(bookName(s.bookId))}</td><td>${s.qty}</td><td><strong>${rupiah(s.total)}</strong></td><td><button class="action-btn delete" data-action="delete" data-type="sales" data-id="${s.id}">Hapus</button></td></tr>`).join("")||emptyRow(7,"Belum ada transaksi penjualan.");
}
function renderAll(){renderStats();renderBooks();renderSuppliers();renderCustomers();renderSales()}
const schemas={
 books:{title:"Buku",fields:[
  {key:"isbn",label:"ISBN",placeholder:"978...",required:true},
  {key:"title",label:"Judul Buku",placeholder:"Masukkan judul buku",required:true,full:true},
  {key:"author",label:"Penulis",placeholder:"Nama penulis",required:true},
  {key:"supplierId",label:"Supplier",type:"select",options:()=>data.suppliers.map(s=>({value:s.id,label:s.name})),required:true},
  {key:"price",label:"Harga Jual (Rp)",type:"number",min:0,required:true},
  {key:"stock",label:"Stok Awal",type:"number",min:0,required:true}
 ]},
 suppliers:{title:"Supplier",fields:[
  {key:"name",label:"Nama Supplier",required:true,full:true},{key:"contact",label:"Nama Kontak",required:true},
  {key:"phone",label:"Nomor Telepon",required:true},{key:"address",label:"Alamat",required:true,full:true}
 ]},
 customers:{title:"Pelanggan",fields:[
  {key:"name",label:"Nama Pelanggan",required:true,full:true},{key:"phone",label:"Nomor Telepon",required:true},
  {key:"email",label:"Email",type:"email"},{key:"address",label:"Alamat",required:true,full:true}
 ]},
 sales:{title:"Transaksi Penjualan",fields:[
  {key:"customerId",label:"Pelanggan",type:"select",options:()=>data.customers.map(c=>({value:c.id,label:c.name})),required:true},
  {key:"bookId",label:"Buku",type:"select",options:()=>data.books.map(b=>({value:b.id,label:`${b.title} — stok ${b.stock} — ${rupiah(b.price)}`})),required:true},
  {key:"qty",label:"Jumlah Buku",type:"number",min:1,required:true},
  {key:"date",label:"Tanggal Transaksi",type:"date",required:true}
 ]}
};
function openForm(type,id=null){
 if(type==="sales"&&(!data.books.length||!data.customers.length)){showToast("Tambahkan data buku dan pelanggan terlebih dahulu.");return}
 if(type==="books"&&!data.suppliers.length){showToast("Tambahkan minimal satu supplier terlebih dahulu.");return}
 editing=id===null?null:{type,id};
 const schema=schemas[type], item=id===null?{}:data[type].find(x=>x.id===id);
 $("dialogEyebrow").textContent=editing?"UBAH DATA":"TAMBAH DATA";
 $("dialogTitle").textContent=(editing?"Edit ":"Tambah ")+schema.title;
 $("formFields").innerHTML=schema.fields.map(f=>{
  const value=item?.[f.key]??(f.key==="qty"?1:f.key==="date"?new Date().toISOString().slice(0,10):"");
  let control="";
  if(f.type==="select"){
   const opts=f.options();
   control=`<select id="field_${f.key}" name="${f.key}" ${f.required?"required":""}>${opts.map(o=>`<option value="${o.value}" ${String(value)===String(o.value)?"selected":""}>${esc(o.label)}</option>`).join("")}</select>`;
  }else{
   control=`<input id="field_${f.key}" name="${f.key}" type="${f.type||"text"}" value="${esc(value)}" ${f.placeholder?`placeholder="${esc(f.placeholder)}"`:""} ${f.min!==undefined?`min="${f.min}"`:""} ${f.required?"required":""} ${f.type==="number"?"step":"data-none"}="${f.type==="number"?"1":""}">`;
  }
  return `<div class="field ${f.full?"full":""}"><label for="field_${f.key}">${f.label}${f.required?" *":""}</label>${control}</div>`;
 }).join("");
 $("dataDialog").showModal();
}
function closeForm(){$("dataDialog").close();editing=null}
$("dataForm").addEventListener("submit",async e=>{
 e.preventDefault();const form=new FormData(e.currentTarget);const type=editing?.type||activeType();const schema=schemas[type];const item={};
 schema.fields.forEach(f=>{let v=form.get(f.key);if(f.type==="number"||["price","stock","supplierId","customerId","bookId","qty"].includes(f.key))v=Number(v);item[f.key]=v});
 let r;
 if(type==="sales"){
  const book=data.books.find(b=>b.id===item.bookId);
  if(!book||book.stock<item.qty){showToast("Stok buku tidak mencukupi.");return}
  r=await db.from("sales").insert(toDb.sales(item));   // stok berkurang otomatis lewat trigger database
 }else if(editing){
  r=await db.from(type).update(toDb[type](item)).eq("id",editing.id);
 }else{
  r=await db.from(type).insert(toDb[type](item));
 }
 if(r.error){showToast(r.error.code==="23505"?"Data duplikat (ISBN sudah ada).":"Gagal menyimpan: "+r.error.message);return}
 closeForm();await loadData();showToast(type==="sales"?"Transaksi berhasil disimpan.":"Data berhasil disimpan.");
});
function activeType(){return document.querySelector(".tab.active").dataset.panel}
async function deleteRecord(type,id){
 const item=data[type].find(x=>x.id===id);if(!item)return;
 if(type==="books"&&data.sales.some(s=>s.bookId===id)){showToast("Buku memiliki riwayat transaksi, tidak dapat dihapus.");return}
 if(type==="customers"&&data.sales.some(s=>s.customerId===id)){showToast("Pelanggan memiliki riwayat transaksi, tidak dapat dihapus.");return}
 if(type==="suppliers"&&data.books.some(b=>b.supplierId===id)){showToast("Supplier masih digunakan oleh data buku.");return}
 if(!confirm(`Hapus ${type==="sales"?"transaksi "+item.number:"data ini"}?`))return;
 const r=await db.from(type).delete().eq("id",id);   // stok dikembalikan otomatis lewat trigger database
 if(r.error){showToast("Gagal menghapus: "+r.error.message);return}
 await loadData();showToast("Data berhasil dihapus.");
}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
 document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id==="panel-"+btn.dataset.panel));
}));
$("addBookBtn").onclick=()=>openForm("books");$("addSupplierBtn").onclick=()=>openForm("suppliers");$("addCustomerBtn").onclick=()=>openForm("customers");$("addSaleBtn").onclick=()=>openForm("sales");
$("closeDialog").onclick=closeForm;$("cancelDialog").onclick=closeForm;
document.querySelectorAll("#bookSearch,#supplierSearch,#customerSearch,#salesSearch").forEach(el=>el.addEventListener("input",renderAll));
document.body.addEventListener("click",e=>{
 const btn=e.target.closest("[data-action]");if(!btn)return;
 const type=btn.dataset.type,id=Number(btn.dataset.id);
 if(btn.dataset.action==="edit")openForm(type,id);else if(btn.dataset.action==="delete")deleteRecord(type,id);
});
renderAll();loadData();
