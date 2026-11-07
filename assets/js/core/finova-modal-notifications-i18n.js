/* FINOVA bilingual confirmation/notification presentation layer. No transaction changes. */
(()=>{'use strict';
const lang=()=>{try{return localStorage.getItem('finova-ui-language')==='en'?'en':'id'}catch(_){return document.documentElement.lang==='en'?'en':'id'}};
const pairs=[
['Confirm Delete Chart Of Account','Konfirmasi Hapus Bagan Akun'],
['Confirm Delete Chart of Accounts','Konfirmasi Hapus Bagan Akun'],
['Confirm Delete Business Partner','Konfirmasi Hapus Mitra Bisnis'],
['Confirm Delete Account','Konfirmasi Hapus Akun'],
['Are you sure you want to delete this account?','Apakah Anda yakin ingin menghapus akun ini?'],
['Apakah Anda yakin ingin menghapus Chart Of Account ini?','Apakah Anda yakin ingin menghapus akun ini?'],
['Deleted accounts cannot be restored.','Akun yang dihapus tidak dapat dipulihkan.'],
['Chart Of Account yang dihapus tidak dapat dikembalikan.','Akun yang dihapus tidak dapat dipulihkan.'],
['Chart Of Account yang dihapus tidak dapat dikembalikan','Akun yang dihapus tidak dapat dipulihkan'],
['Account Code','Kode Akun'],['Account Name','Nama Akun'],['Parent Account','Akun Induk'],
['Yes, Delete','Ya, Hapus'],['Yes, delete','Ya, Hapus'],['Cancel','Batal'],
['Confirm Delete','Konfirmasi Hapus'],['Confirm Action','Konfirmasi Tindakan'],
['Are you sure?','Apakah Anda yakin?'],['Are you sure you want to continue?','Apakah Anda yakin ingin melanjutkan?'],
['This action cannot be undone.','Tindakan ini tidak dapat dibatalkan.'],
['Delete successful','Berhasil dihapus'],['Successfully deleted','Berhasil dihapus'],
['Deleted successfully.','Berhasil dihapus.'],['Saved successfully.','Berhasil disimpan.'],
['Updated successfully.','Berhasil diperbarui.'],['Created successfully.','Berhasil ditambahkan.'],
['Operation successful.','Tindakan berhasil.'],['Success','Berhasil'],['Error','Kesalahan'],
['Warning','Peringatan'],['Information','Informasi'],['Failed','Gagal'],
['Data saved successfully.','Data berhasil disimpan.'],['Data deleted successfully.','Data berhasil dihapus.'],
['Data updated successfully.','Data berhasil diperbarui.'],
['Failed to save data.','Gagal menyimpan data.'],['Failed to delete data.','Gagal menghapus data.'],
['Failed to load data.','Gagal memuat data.'],
['Chart of Accounts cannot be deleted because it is still being used in transactions.','Bagan Akun tidak dapat dihapus karena masih digunakan dalam transaksi.'],
['Chart Of Account cannot be deleted because it is still being used.','Bagan Akun tidak dapat dihapus karena masih digunakan dalam transaksi.'],
['Business Partner cannot be deleted or modified because it is used in GL Journal details.','Mitra Bisnis tidak dapat dihapus atau diubah karena masih digunakan pada rincian Jurnal GL.'],
['You do not have permission to perform this action.','Anda tidak memiliki izin untuk melakukan tindakan ini.'],
['This record already exists. Please use a different value.','Data sudah terdaftar. Gunakan nilai yang berbeda.']
];
const idToEn=new Map(pairs.map(([en,id])=>[id,en]));
const enToId=new Map(pairs);
const source=new WeakMap();
const scope='.modal,.toast,.alert,.swal2-popup,[role="alert"],[role="alertdialog"],.bootbox,.sweet-alert';
function translateText(raw,target){
 const trim=raw.trim();if(!trim)return raw;
 let out=trim;
 if(target==='id'){
  out=enToId.get(trim)||trim;
  out=out.replace(/^(?:Chart Of Account|Chart of Accounts|Bagan Akun) cannot be deleted because it is still being used\.?$/i,'Bagan Akun tidak dapat dihapus karena masih digunakan dalam transaksi.');
  out=out.replace(/^(?:Business Partner|Mitra Bisnis) cannot be deleted because it is still being used\.?$/i,'Mitra Bisnis tidak dapat dihapus karena masih digunakan dalam transaksi.');
  out=out.replace(/^Apakah Anda yakin ingin$/i,'Apakah Anda yakin ingin');
  out=out.replace(/^menghapus (?:Chart Of Account|Chart of Accounts|Bagan Akun)$/i,'menghapus akun');
 }else{
  out=idToEn.get(trim)||trim;
  out=out.replace(/^Apakah Anda yakin ingin$/i,'Are you sure you want to');
  out=out.replace(/^menghapus (?:Chart Of Account|Chart of Accounts|Bagan Akun|akun)$/i,'delete this account');
  out=out.replace(/^ini\?$/i,'?');
  out=out.replace(/^(?:Chart Of Account|Chart of Accounts|Bagan Akun) tidak dapat dihapus karena masih digunakan(?: dalam transaksi)?\.?$/i,'Chart of Accounts cannot be deleted because it is still being used in transactions.');
 }
 if(out===trim)return raw;
 return raw.replace(trim,out);
}
function process(){const target=lang();document.querySelectorAll(scope).forEach(root=>{
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  if(node.parentElement?.closest('script,style,textarea,input,option,[contenteditable="true"]'))return;
  const current=node.nodeValue;if(!current.trim())return;
  const previous=source.get(node);
  let original=previous?.last===current?previous.original:current;
  const result=translateText(original,target);
  if(result!==current)node.nodeValue=result;
  source.set(node,{original,last:result});
 });
 });}
let scheduled=false;function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;observer.disconnect();try{process()}finally{observer.observe(document.body,{subtree:true,childList:true,characterData:true})}})}
const observer=new MutationObserver(queue);
function start(){process();observer.observe(document.body,{subtree:true,childList:true,characterData:true});window.addEventListener('finova:language-changed',()=>{sourceReset();queue()});}
function sourceReset(){/* Preserve original source text so switching languages is reversible. */}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
