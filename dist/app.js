const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected='C', returnMode='boat';
const names=k=>PLACES[k].short;
const dateRange=(start,n)=>n===1?`${String(start).padStart(2,'0')}. Jan.`:`${String(start).padStart(2,'0')}.–${String(start+n-1).padStart(2,'0')}. Jan.`;
function effectiveRoute(route){
 const r=JSON.parse(JSON.stringify(route));
 if(r.id==='C'&&returnMode==='flight'){
  r.flights=1;r.boat='1 Seefähre';r.cost='Mittel';
  r.days.find(d=>d.date===14).activity='Flug nach HCMC · nachmittags Stadtzeit je nach Ankunft';
  r.days.find(d=>d.date===14).transfer='4–6 h gesamt · 1 Flug';
  r.transfers[3]=['14.01.','Phú Quốc → HCMC','Flug · ca. 4–6 h gesamt','Einziger Inlandsflug; gleiche Übernachtungsorte wie bei der Bootsvariante.'];
  r.tradeoffs[1]='Langer Landtransfer am 08.; am 14. stattdessen ein Flug';
 }
 return r;
}
function choice(r){return `<button type="button" class="choice" id="choice-${r.id}" style="--accent:${r.color}" data-route="${r.id}" aria-pressed="${r.id===selected}" aria-controls="routenvorschau"><small>${r.id} / ${r.label}</small><strong>${r.title}</strong><small>${r.teaser}</small><small>${r.mini}</small><span class="ribbon">${r.ribbon}</span></button>`}
function renderChoices(){for(const who of ['amelie','adrian'])$(`#${who}-choices`).innerHTML=ROUTES.filter(r=>r.owner===who).map(choice).join('')}
function renderComparison(){
 $('#comparison-table').innerHTML='<thead><tr><th>Route</th><th>Wald & Tiere</th><th>Insel</th><th>Đà Lạt / Mekong</th><th>Verkehr</th><th>Standorte / Wechsel</th><th>Tempo / Kosten</th><th>Größter Kompromiss</th></tr></thead><tbody>'+ROUTES.map(base=>{const r=effectiveRoute(base);return `<tr class="${r.id===selected?'active-row':''}"><td><button type="button" class="route-link" data-route="${r.id}" data-jump="true">${r.id} · ${r.title}</button><small>${r.label}</small></td><td>${r.forest}</td><td>${r.island}</td><td>Đà Lạt: ${r.dalat}<br>Delta: ${r.delta}</td><td>${r.flights} ${r.flights===1?'Inlandsflug':'Inlandsflüge'}<br>${r.boat}${r.id==='C'?'<small>Rückweg in Vorschau umstellbar</small>':''}</td><td>${r.bases} Orte<br>${r.moves} Wechsel</td><td>${r.pace}<br><small>${r.cost}</small></td><td>${r.tradeoffs[0]}</td></tr>`}).join('')+'</tbody>';
}
function renderRoute(){
 const r=effectiveRoute(ROUTES.find(r=>r.id===selected));
 const counts={};r.stays.forEach(([p,start,n])=>{counts[p]=(counts[p]||0)+n});
 $('#routenvorschau').style.setProperty('--accent',r.color);
 $('#routenvorschau').innerHTML=`<div class="route-header"><div class="eyebrow">02 / Vorschau · ${r.id} · ${r.label}</div><h2 id="route-title" tabindex="-1">${r.title}</h2><p class="verdict">${r.verdict}</p><p>${r.description}</p></div>
 <div class="chips"><span>${r.flights} ${r.flights===1?'Inlandsflug':'Inlandsflüge'}</span><span>${r.boat}</span><span>13 Nächte · ${r.bases} verschiedene Orte</span><span>${r.moves} Unterkunftswechsel</span><span>Keine Nachtfahrt nötig</span></div>
 <div class="route-actions"><a class="pill-button" href="#ablauf">Zum Tagesplan ↓</a><a class="pill-button" href="#vergleich">Zum Vergleich ↓</a>${r.id==='C'?`<label class="mode" for="return-mode">Rückweg am 14. Januar<select id="return-mode"><option value="boat" ${returnMode==='boat'?'selected':''}>Fähre + Bus · 0 Flüge insgesamt</option><option value="flight" ${returnMode==='flight'?'selected':''}>Flug nach HCMC · 1 Flug insgesamt</option></select></label>`:''}</div>
 <div class="layout"><aside class="map-box"><img src="assets/route-${r.id}${r.id==='C'&&returnMode==='flight'?'-flight':''}.svg" alt="Karte der Ortsfolge: ${r.description}"><div class="map-copy"><h3>Unsere Übernachtungsorte</h3><ol>${r.stays.map(([p,start,n])=>`<li><b>${names(p)}</b> · ${n} ${n===1?'Nacht':'Nächte'}</li>`).join('')}</ol><div class="footnote">Linien = schematische Ortsfolge, keine Straßen.<br>Durchgezogen: Land · gestrichelt: Fähre · gepunktet: Flug<br>HCMC mehrfach = Rückkehr zur selben Stadt.</div></div></aside>
 <div class="stops">${r.places.map((id,index)=>{const p=PLACES[id];return `<article class="stop"><img src="assets/${p.image}" alt="${esc(p.caption.replace('Bild: ',''))}" loading="lazy" width="600" height="400"><div class="stop-content"><div class="stay">${counts[id]} Nächte${id==='hcm'?' insgesamt · inklusive Ankunft / Puffer':''}</div><h3>${p.name}</h3><ul>${p.bullets.map(b=>`<li>${b}</li>`).join('')}</ul><div class="tags">${p.tags.map(([type,label])=>`<a class="tag ${type}" href="#${type==='research'?'quellen':'herkunft'}">${type==='video'?'▷':type==='research'?'↗':'●'} ${label}</a>`).join('')}</div><p class="photo-caption">${p.caption}</p><a class="small-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.url.includes('google.com')?'Ort auf der Karte':'Ortsinfo / Quelle'} ↗</a></div></article>`}).join('')}</div></div>
 <div class="timeline" aria-label="Übernachtungsblöcke">${r.stays.map(([p,start,n])=>`<div class="night"><b>${dateRange(start,n)}</b>${names(p)}<span>${n} ${n===1?'Nacht':'Nächte'}</span></div>`).join('')}</div>
 <div class="route-notes"><div><h3>Das passt zu euch</h3><ul>${r.wins.map(w=>`<li>${w}</li>`).join('')}</ul></div><div><h3>Das kostet euch die Wahl</h3><ul>${r.tradeoffs.map(w=>`<li>${w}</li>`).join('')}</ul></div></div>
 <div class="plan-heading" id="ablauf"><h2>Tag für Tag.</h2><span>04.–17. Januar 2027 · Nächte jeweils ab dem genannten Datum</span></div>
 <div class="table-scroll" role="region" aria-label="Tagesplan Route ${r.id}" tabindex="0"><table class="day-table"><thead><tr><th>Datum</th><th>Wo?</th><th>Konkreter Plan</th><th>Übernachtung</th></tr></thead><tbody>${r.days.map(d=>`<tr class="${d.transfer?'transfer-day':''}"><th scope="row">${String(d.date).padStart(2,'0')}. Jan.</th><td>${d.place}</td><td>${d.activity}${d.transfer?`<span class="transfer">↗ Transfer: ${d.transfer}</span>`:''}</td><td class="sleep">${d.sleep?names(d.sleep):'— Rückreise'}</td></tr>`).join('')}</tbody></table></div>
 <div class="caveat">${r.note}</div>
 <details><summary>Alle Transfers für Route ${r.id} · Fahrtdauer & Anschlüsse</summary><div class="table-scroll"><table class="transfer-table"><thead><tr><th>Wann / Strecke</th><th>Verkehrsmittel & Zeit</th><th>Einplanen</th></tr></thead><tbody>${r.transfers.map(t=>`<tr><th>${t[0]}<br>${t[1]}</th><td>${t[2]}</td><td>${t[3]}</td></tr>`).join('')}</tbody></table></div><p class="footnote">Alle Gesamtzeiten inklusive grober Reserve für Hotelwege / Umstieg, sofern angegeben. Januar-Verbindungen noch nicht bestätigt. Bei zu spätem Anschluss eine Aktivität kürzen; den Rückflugpuffer nicht aufbrauchen. Keine durchgehende Bahnverbindung nach Đà Lạt eingeplant.</p></details>`;
 renderComparison();
}
function setRoute(id,{jump=false,updateHash=true}={}){
 if(!ROUTES.some(r=>r.id===id))return;
 selected=id;renderChoices();renderRoute();
 $('#selection-status').textContent=`Route ${id}: ${ROUTES.find(r=>r.id===id).title} ausgewählt. Tagesplan und Karte aktualisiert.`;
 if(updateHash){try{history.replaceState(null,'',`#route-${id}${id==='C'&&returnMode==='flight'?'-flug':''}`)}catch{}}
 if(jump){$('#routenvorschau').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#route-title').focus({preventScroll:true})}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(b){const id=b.dataset.route,jump=b.dataset.jump==='true';setRoute(id,{jump});if(!jump)$(`#choice-${id}`).focus({preventScroll:true})}});
document.addEventListener('change',e=>{if(e.target.id==='return-mode'){returnMode=e.target.value;setRoute(selected);$('#return-mode').focus({preventScroll:true})}});
function readHash(){const m=location.hash.match(/^#route-([A-E])(-flug)?$/);if(m){returnMode=m[2]?'flight':'boat';setRoute(m[1],{updateHash:false})}}
window.addEventListener('hashchange',readHash);
$('#print').addEventListener('click',()=>window.print());
$('#credits').innerHTML=IMAGE_CREDITS.map(x=>`<div><a href="${esc(x.page)}">${esc(x.label)}</a> · ${esc(x.artist)} · ${esc(x.license)}</div>`).join('');
setRoute('C',{updateHash:false});readHash();
