/* DABSKY CREATIVE STUDIO — BUSINESS CONTACT
   Quote requests launch the visitor's own email application.
   No inquiry is transmitted unless the visitor sends the email.
*/
const CONTACT_EMAIL = 'dabskycreativestudio@gmail.com';

const menu = document.querySelector('.mobile-menu');
const links = document.querySelector('.nav-links');
menu.addEventListener('click',()=>{const open = links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false');}));

const cards = Array.from(document.querySelectorAll('.work-card'));
const filters = Array.from(document.querySelectorAll('.filter-btn'));
const showMore = document.getElementById('show-more');
const status = document.getElementById('filter-status');
let activeFilter = 'all', expanded=false;
function renderPortfolio(){
  let matching=0;
  cards.forEach(card=>{
    let match=activeFilter==='all'||card.dataset.cat===activeFilter;
    if(match) matching++;
    const visible=match&&(expanded||matching<=8);
    card.hidden=!visible;
  });
  const show=matching>8;
  showMore.hidden=!show;
  if(show){showMore.style.display='flex';showMore.innerHTML=expanded?'Show fewer concepts <span aria-hidden="true">↑</span>':`See all ${matching} concepts <span aria-hidden="true">↓</span>`;showMore.setAttribute('aria-expanded',String(expanded));}
  else showMore.style.display='none';
  status.textContent=`Showing ${Math.min(matching,expanded?matching:8)} of ${matching} portfolio concepts`;
}
filters.forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;expanded=false;filters.forEach(f=>{const current=f===btn;f.classList.toggle('active',current);f.setAttribute('aria-pressed',String(current));});renderPortfolio();}));
showMore.addEventListener('click',()=>{expanded=!expanded;renderPortfolio();if(!expanded)document.getElementById('work-title').scrollIntoView({behavior:'smooth',block:'start'});});
renderPortfolio();

const dialog=document.getElementById('work-dialog');
const dialogImg=document.getElementById('dialog-image');
const dialogTitle=document.getElementById('dialog-title');
let dialogCurrent=0,displayed=[];
function openCard(card){displayed=cards.filter(el=>!el.hidden);dialogCurrent=displayed.indexOf(card);updateDialog();if(!dialog.open)dialog.showModal();}
function updateDialog(){const card=displayed[dialogCurrent];if(!card)return;dialogImg.src=card.dataset.img;dialogImg.alt=card.querySelector('img').alt;dialogTitle.textContent=card.dataset.name;}
function nextDialog(delta){if(!displayed.length)return;dialogCurrent=(dialogCurrent+delta+displayed.length)%displayed.length;updateDialog();}
cards.forEach(card=>card.addEventListener('click',()=>openCard(card)));
document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
document.getElementById('dialog-prev').addEventListener('click',()=>nextDialog(-1));
document.getElementById('dialog-next').addEventListener('click',()=>nextDialog(1));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowRight')nextDialog(1);if(e.key==='ArrowLeft')nextDialog(-1);});

const interest=document.getElementById('package');
document.querySelectorAll('[data-package]').forEach(link=>link.addEventListener('click',()=>{interest.value=link.dataset.package;}));
const form=document.getElementById('inquiry-form');
const feedback=document.getElementById('form-feedback');
form.addEventListener('submit',(event)=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const inquiry=`DABSKY CREATIVE STUDIO — QUOTE REQUEST\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nBusiness: ${data.get('business')||'(not specified)'}\nPackage: ${data.get('package')}\nProject details:\n${data.get('details')||'(not specified)'}`;
  const subject=`Dabsky quote request — ${String(data.get('business')||'new project').trim().slice(0,80)}`;
  const link=`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiry)}`;
  feedback.textContent='Your email app should open with your inquiry ready to send. Please review it and tap Send. If nothing opens, email us directly using the address shown beside this form.';
  window.location.href=link;
});
document.getElementById('year').textContent=new Date().getFullYear();
