/* FINOVA UI-only dark mode. Does not touch router, Supabase or translations. */
(function(){
  'use strict';
  const KEY='finova-ui-theme';
  const doc=document.documentElement;
  let selected='light';
  try {selected=localStorage.getItem(KEY)==='dark'?'dark':'light';}catch(_e){}
  function apply(theme){
    selected=theme==='dark'?'dark':'light';
    doc.setAttribute('data-finova-theme',selected);
    doc.setAttribute('data-bs-theme',selected);
    try{localStorage.setItem(KEY,selected);}catch(_e){}
    document.querySelectorAll('.finova-theme-toggle').forEach(function(button){
      const dark=selected==='dark';
      button.setAttribute('aria-pressed',String(dark));
      button.setAttribute('title',dark?'Aktifkan Mode Terang':'Aktifkan Mode Gelap');
      button.setAttribute('aria-label',dark?'Aktifkan Mode Terang':'Aktifkan Mode Gelap');
      button.innerHTML='<i class="fa-solid '+(dark?'fa-sun':'fa-moon')+'" aria-hidden="true"></i><span class="finova-theme-label">'+(dark?'Mode Terang':'Mode Gelap')+'</span>';
    });
  }
  function ensureToggle(){
    const host=document.querySelector('.finova-topbar-right');
    if(!host||host.querySelector('.finova-theme-toggle'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='finova-theme-toggle';
    btn.addEventListener('click',function(){apply(selected==='dark'?'light':'dark');});
    host.insertBefore(btn,host.firstChild);
    apply(selected);
  }
  apply(selected);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureToggle,{once:true});
  else ensureToggle();
  // The application may create #finova-topbar after DOMContentLoaded.
  // Observe only until the host exists, then watch its direct children.
  let topbarObserver=null;
  const hostObserver=new MutationObserver(function(){
    const host=document.getElementById('finova-topbar');
    if(!host)return;
    hostObserver.disconnect();
    ensureToggle();
    topbarObserver=new MutationObserver(function(){ensureToggle();});
    topbarObserver.observe(host,{childList:true});
  });
  function watchTopbar(){
    const host=document.getElementById('finova-topbar');
    if(host){
      ensureToggle();
      topbarObserver=new MutationObserver(function(){ensureToggle();});
      topbarObserver.observe(host,{childList:true});
    }else if(document.body){
      hostObserver.observe(document.body,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchTopbar,{once:true});
  else watchTopbar();
})();
