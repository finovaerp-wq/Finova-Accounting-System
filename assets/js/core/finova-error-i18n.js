/* FINOVA: bilingual user-facing Bootstrap error notifications. Presentation only. */
(()=>{'use strict';
const language=()=>{try{return localStorage.getItem('finova-ui-language')==='en'?'en':'id'}catch(_){return document.documentElement.lang==='en'?'en':'id'}};
const patterns=[
[/^(?:Chart Of Account|Chart of Accounts|Bagan Akun) cannot be deleted because it is still being used\.?$/i,['Bagan Akun tidak dapat dihapus karena masih digunakan dalam transaksi.','Chart of Accounts cannot be deleted because it is still being used in transactions.']],
[/^(?:Chart Of Account|Chart of Accounts|Bagan Akun) cannot be deleted because it still has child accounts\.?$/i,['Bagan Akun tidak dapat dihapus karena masih memiliki akun turunan.','Chart of Accounts cannot be deleted because it still has child accounts.']],
[/^(?:Chart Of Account|Chart of Accounts|Bagan Akun) cannot be deleted because it is referenced by [^\n]+/i,['Bagan Akun tidak dapat dihapus karena masih digunakan oleh data lain.','Chart of Accounts cannot be deleted because it is referenced by other records.']],
[/^(?:Mitra Bisnis|Business Partner) cannot be deleted(?: or modified)? because it is still (?:being )?used/i,['Mitra Bisnis tidak dapat dihapus karena masih digunakan dalam transaksi.','Business Partner cannot be deleted because it is still used in transactions.']],

[/foreign key constraint|violates foreign key|23503/i,['Data tidak dapat dihapus atau diubah karena masih digunakan pada transaksi lain.','This record cannot be deleted or modified because it is used by another transaction.']],
[/duplicate key|unique constraint|23505/i,['Data sudah terdaftar. Gunakan nilai yang berbeda.','This record already exists. Please use a different value.']],
[/not-null constraint|null value in column|23502/i,['Ada kolom wajib yang belum diisi.','A required field is missing.']],
[/permission denied|row-level security|42501/i,['Anda tidak memiliki izin untuk melakukan tindakan ini.','You do not have permission to perform this action.']],
[/invalid input syntax|22p02/i,['Format data tidak valid. Periksa kembali isian Anda.','Invalid data format. Please review your entries.']],
[/network|failed to fetch|fetch failed/i,['Koneksi gagal. Periksa jaringan dan coba kembali.','Connection failed. Check your network and try again.']],
[/jwt expired|session expired/i,['Sesi Anda telah berakhir. Silakan masuk kembali.','Your session has expired. Please sign in again.']],
[/no open period/i,['Tidak ada periode akuntansi yang terbuka.','There is no open accounting period.']],
[/failed to load|unable to load/i,['Gagal memuat data. Silakan coba kembali.','Failed to load data. Please try again.']],
[/failed to save/i,['Gagal menyimpan data. Silakan coba kembali.','Failed to save data. Please try again.']],
[/failed to delete/i,['Gagal menghapus data. Silakan coba kembali.','Failed to delete data. Please try again.']]
];
const messages={
 'Data tidak dapat dihapus atau diubah karena masih digunakan pada transaksi lain.':'This record cannot be deleted or modified because it is used by another transaction.',
 'Anda tidak memiliki izin untuk melakukan tindakan ini.':'You do not have permission to perform this action.',
 'Gagal memuat data. Silakan coba kembali.':'Failed to load data. Please try again.'
};
function translate(value){const raw=String(value??'').trim();if(!raw)return raw;const en=language()==='en';
 for(const [regex,pair] of patterns)if(regex.test(raw)){
  if(/trx_gl_journal_detail_business_partner_id_fkey/i.test(raw))return en?'Business Partner cannot be deleted or modified because it is used in GL Journal details.':'Mitra Bisnis tidak dapat dihapus atau diubah karena masih digunakan pada rincian Jurnal GL.';
  return pair[en?1:0];
 }
 if(messages[raw])return en?messages[raw]:raw;
 if(en){for(const [id,english] of Object.entries(messages))if(raw===id)return english;}
 return raw;
}
window.FinovaErrorI18n={translate,language};
// Only alter visible notification text, never data values, form fields or errors in the console.
const selector='.toast-body,.alert:not(.alert-info):not(.alert-success),.swal2-html-container,.swal2-title,.finova-error-message,[role="alert"]';
const active=new Set();
function process(root){if(!(root instanceof Element))return;const nodes=[];if(root.matches(selector))nodes.push(root);root.querySelectorAll(selector).forEach(n=>nodes.push(n));
 for(const node of nodes){if(node.closest('form')&&node.matches('[role="alert"]')&&node.querySelector('input,select,textarea'))continue;
  if(node.children.length && [...node.children].some(c=>c.matches?.('button,input,select,textarea')))continue;
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);const changes=[];while(walker.nextNode()){const t=walker.currentNode;if(!t.textContent.trim())continue;const result=translate(t.textContent);if(result!==t.textContent)changes.push([t,result]);}
  for(const [t,v] of changes)t.textContent=v;
 }
}
let queued=false;const queue=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;process(document.body)})};
const start=()=>{queue();const obs=new MutationObserver(queue);obs.observe(document.body,{subtree:true,childList:true,characterData:true});window.addEventListener('finova:language-changed',queue)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
