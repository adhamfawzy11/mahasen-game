/* Mahasen Game Widget • hosted independently of Google Tag Manager */
(function(){
  'use strict';
  if (window.__mahasenWidgetLoaded) return;
  window.__mahasenWidgetLoaded = true;
  var ORIGIN='https://adhamfawzy11.github.io';
  var GAME_URL=ORIGIN+'/mahasen-game/?embed=1&v=8';
  var overlay=null,frame=null,lastFocus=null,oldOverflow='';
  function addButton(){
    if(!document.body||document.getElementById('mahasen-widget-launch'))return;
    var button=document.createElement('button');
    button.id='mahasen-widget-launch';
    button.type='button';
    button.textContent='🎯 العب واربح مع محاسن';
    button.setAttribute('aria-label','افتح لعبة محاسن');
    button.style.cssText='position:fixed;right:18px;bottom:24px;z-index:2147483000;border:0;border-radius:28px;background:#076b83;color:#fff;font:700 15px Tahoma,Arial,sans-serif;padding:14px 20px;box-shadow:0 6px 22px #002b3c55;cursor:pointer;max-width:calc(100vw - 36px)';
    button.addEventListener('click',openGame);
    document.body.appendChild(button);
  }
  function pushEvent(payload){
    if(!payload||typeof payload.event!=='string'||payload.event.indexOf('mahasen_')!==0)return;
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(payload);
  }
  function openGame(){
    if(overlay)return;
    lastFocus=document.activeElement;
    oldOverflow=document.body.style.overflow;
    overlay=document.createElement('div');
    overlay.id='mahasen-widget-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','لعبة محاسن');
    overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,20,30,.72);display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box';
    var shell=document.createElement('div');
    shell.style.cssText='position:relative;display:flex;width:min(100%,550px);height:94vh;max-height:920px;background:#d9eef8;border-radius:17px;overflow:hidden;box-shadow:0 18px 60px #001e2e55';
    frame=document.createElement('iframe');
    frame.src=GAME_URL;
    frame.title='Mahasen Bottle Blaster';
    frame.setAttribute('allow','autoplay');
    frame.setAttribute('loading','eager');
    frame.style.cssText='width:100%;height:100%;border:0;display:block;background:#e0f3fc';
    var close=document.createElement('button');
    close.type='button';
    close.textContent='×';
    close.setAttribute('aria-label','إغلاق اللعبة');
    close.style.cssText='position:absolute;z-index:5;top:10px;left:10px;width:42px;height:42px;border:0;border-radius:50%;background:#08647a;color:white;font-size:30px;line-height:40px;cursor:pointer';
    close.addEventListener('click',closeGame);
    shell.appendChild(frame);
    shell.appendChild(close);
    overlay.appendChild(shell);
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeGame();});
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';
    close.focus();
    pushEvent({event:'mahasen_widget_open',game_version:'v8'});
  }
  function closeGame(){
    if(!overlay)return;
    overlay.remove();overlay=null;frame=null;
    document.body.style.overflow=oldOverflow;
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
    pushEvent({event:'mahasen_widget_close',game_version:'v8'});
  }
  window.addEventListener('message',function(e){
    if(e.origin!==ORIGIN||!frame||e.source!==frame.contentWindow)return;
    if(!e.data||e.data.type!=='mahasen_game_event')return;
    pushEvent(e.data.payload);
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeGame();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton,{once:true});
  else addButton();
})();
