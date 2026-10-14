/* CarbonWise: client-side demo. All demo factors and financial assumptions are illustrative. */
const $ = (id) => document.getElementById(id);
const DEFAULT_FACTORS = { road: 0.105, rail: 0.028, sea: 0.016, air: 0.602, electric: 0.045 };
const MODES = [
  {key:"road", name:"Road freight", icon:"▰", factor:0.105, cost:32, hoursPer100:2.2, transitLabel:"1–2 days / 800 km"},
  {key:"rail", name:"Rail freight", icon:"▤", factor:0.028, cost:18, hoursPer100:3.2, transitLabel:"2–4 days / 800 km"},
  {key:"sea", name:"Sea freight", icon:"⌁", factor:0.016, cost:12, hoursPer100:5.0, transitLabel:"Route-dependent"},
  {key:"air", name:"Air freight", icon:"✈", factor:0.602, cost:180, hoursPer100:0.45, transitLabel:"Same day–1 day"},
  {key:"electric", name:"Electric vehicle", icon:"⚡", factor:0.045, cost:27, hoursPer100:2.4, transitLabel:"Route-dependent"}
];
const DEFAULT_STATE = {
  factors:{...DEFAULT_FACTORS},
  compareDistance:800, compareWeight:5, compareCost:1,
  baseline:42800, target:20, period:12,
  vehicleMode:"diesel", distance:250, consumption:32, factor:2.68,
  lastCalculation:{emissions:85.76, perKm:0.343, energy:32, unit:"L", factor:2.68, mode:"diesel"}
};
let state = structuredCloneSafe(DEFAULT_STATE);
let toastTimer;

function structuredCloneSafe(obj){ return JSON.parse(JSON.stringify(obj)); }
function fmt(value, digits=0){ return Number(value).toLocaleString("en-IN",{maximumFractionDigits:digits,minimumFractionDigits:digits}); }
function fmtCompact(value){ if(value>=100000) return "₹"+(value/100000).toFixed(1)+"L"; if(value>=1000) return "₹"+(value/1000).toFixed(1)+"k"; return "₹"+fmt(value); }
function showToast(message){ const toast=$("toast"); toast.textContent=message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2800); }
function safeNum(id, fallback=0){ const n=parseFloat($(id).value); return Number.isFinite(n)?Math.max(0,n):fallback; }

function renderTrendChart(){
  const svg=$("trendChart"); const vals=[49.2,47.8,51.4,46.7,45.9,48.1,46.2,44.6,46.1,42.8];
  const labels=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];
  const W=620,H=245,pad={l:40,r:16,t:20,b:32},min=38,max=55;
  const x=i=>pad.l+i*(W-pad.l-pad.r)/(vals.length-1);
  const y=v=>pad.t+(max-v)*(H-pad.t-pad.b)/(max-min);
  let out="";
  [40,45,50,55].forEach(v=>{out+=`<line x1="${pad.l}" y1="${y(v)}" x2="${W-pad.r}" y2="${y(v)}" stroke="#e9f0eb" stroke-dasharray="3 4"/><text x="${pad.l-9}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="#829087">${v}</text>`;});
  labels.forEach((lab,i)=>{out+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="10" fill="#829087">${lab}</text>`;});
  const points=vals.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  const area=`${x(0)},${H-pad.b} ${points} ${x(vals.length-1)},${H-pad.b}`;
  out+=`<polygon points="${area}" fill="#dff3e6" opacity=".7"/><polyline points="${points}" fill="none" stroke="#24945d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  vals.forEach((v,i)=>{out+=`<circle cx="${x(i)}" cy="${y(v)}" r="${i===vals.length-1?5:3}" fill="${i===vals.length-1?"#176b45":"#fff"}" stroke="#24945d" stroke-width="2"/>`;});
  out+=`<text x="${x(9)-4}" y="${y(vals[9])-14}" text-anchor="end" font-size="11" font-weight="700" fill="#176b45">42.8 t</text>`;
  svg.innerHTML=out;
}
function renderModeBars(){
  const data=[["Road",46],["Air",25],["Rail",14],["Sea",9],["Electric",6]];
  $("modeBars").innerHTML=data.map(([name,pct])=>`<div><div class="mode-bar-top"><span>${name}</span><span>${pct}%</span></div><div class="mode-bar-track"><span style="width:${pct}%"></span></div></div>`).join("");
}
function updateEnergyFields(){
  const mode=$("vehicleMode").value;
  const settings={
    diesel:{consumption:32,unit:"L",factor:2.68,factorUnit:"kg CO₂ / L",help:"Illustrative diesel combustion factor. Actual factors vary by fuel composition and accounting boundary."},
    petrol:{consumption:30,unit:"L",factor:2.31,factorUnit:"kg CO₂ / L",help:"Illustrative petrol combustion factor. Upstream fuel emissions are not included by default."},
    cng:{consumption:18,unit:"kg",factor:2.75,factorUnit:"kg CO₂ / kg",help:"Illustrative CNG combustion factor. Use a factor aligned to your chosen reporting boundary."},
    electricity:{consumption:48,unit:"kWh",factor:0.71,factorUnit:"kg CO₂ / kWh",help:"Illustrative grid-electricity factor for demonstration only. Actual results depend on grid mix and charging losses."}
  };
  const s=settings[mode];
  $("consumption").value=s.consumption; $("energyUnit").textContent=s.unit;
  $("factor").value=s.factor; $("factorUnit").textContent=s.factorUnit; $("factorHelp").textContent=s.help;
  state.vehicleMode=mode; state.consumption=s.consumption; state.factor=s.factor;
  calculateCarbon(false);
}
function calculateCarbon(showMessage=true){
  const mode=$("vehicleMode").value, distance=safeNum("distance"), consumption=safeNum("consumption"), factor=safeNum("factor");
  const unit=mode==="electricity"?"kWh":mode==="cng"?"kg":"L";
  const emissions=consumption*factor, perKm=distance>0?emissions/distance:0;
  state.vehicleMode=mode; state.distance=distance; state.consumption=consumption; state.factor=factor;
  state.lastCalculation={emissions,perKm,energy:consumption,unit,factor,mode};
  $("calcResult").innerHTML=`${fmt(emissions,2)} <span>kg CO₂</span>`;
  $("calcExplanation").textContent=`${fmt(consumption,2)} ${unit} × ${fmt(factor,3)} kg CO₂/${unit} = ${fmt(emissions,2)} kg CO₂`;
  $("perKm").textContent=`${fmt(perKm,3)} kg/km`; $("energyUsed").textContent=`${fmt(consumption,2)} ${unit}`;
  $("calcInsight").textContent=emissions===0?"With these inputs, the estimated operational emissions are zero. Confirm the factor and energy use before interpreting this result.":`A 10% reduction in energy use at the same factor would reduce this estimate by ${fmt(emissions*.1,2)} kg CO₂.`;
  if(showMessage) showToast("Carbon estimate updated.");
}
function renderFactorEditors(){
  $("factorEditors").innerHTML=MODES.map(m=>`<div class="factor-editor"><label for="factor-${m.key}">${m.name}</label><div class="input-unit"><input id="factor-${m.key}" type="number" min="0" step="0.001" value="${state.factors[m.key]}" aria-label="${m.name} emission factor"><span>kg/t-km</span></div></div>`).join("");
  MODES.forEach(m=>$(`factor-${m.key}`).addEventListener("change",()=>{state.factors[m.key]=safeNum(`factor-${m.key}`); renderComparison();}));
}
function renderComparison(){
  const distance=Math.max(1,safeNum("compareDistance",800)), weight=Math.max(.01,safeNum("compareWeight",5)), mult=Math.max(.1,safeNum("compareCost",1));
  state.compareDistance=distance;state.compareWeight=weight;state.compareCost=mult;
  const rows=MODES.map(m=>{
    const factor=Number(state.factors[m.key]??m.factor), emissions=distance*weight*factor;
    const cost=distance*weight*m.cost*mult;
    const hours=distance/100*m.hoursPer100;
    return {...m,factor,emissions,cost,hours};
  });
  const min= Math.min(...rows.map(r=>r.emissions));
  $("comparisonRows").innerHTML=rows.map(r=>`<tr><td><div class="mode-name"><span class="mode-emoji">${r.icon}</span>${r.name}</div></td><td>${fmt(r.factor,3)}</td><td class="emission-cell"><strong>${fmt(r.emissions,1)} kg ${Math.abs(r.emissions-min)<.0001?'<span class="best-badge">Lowest estimate</span>':""}</strong><small>${fmt(r.emissions/1000,3)} t CO₂</small></td><td>₹${fmt(r.cost,0)}</td><td>${r.key==="sea"&&distance<300?"Route-dependent":r.key==="sea"?"Route-dependent":r.key==="air"?(hours<24?`${fmt(Math.max(4,hours),0)}–24 hrs`:`${fmt(hours/24,1)} days`):r.key==="rail"?(distance<300?"1–2 days":"2–4 days"):r.key==="electric"?(distance<250?"Same day":"Route-dependent"):(distance<300?"Same day":"1–2 days")}</td></tr>`).join("");
}
function calculatePlanner(showMessage=false){
  const baseline=safeNum("baseline"), target=parseInt($("reductionTarget").value,10), period=parseInt($("period").value,10);
  const budget=baseline*(1-target/100), reduction=baseline-budget, monthly=period>0?budget/period:budget;
  state.baseline=baseline;state.target=target;state.period=period;
  $("targetValue").textContent=`${target}%`; $("budgetResult").innerHTML=`${fmt(budget,0)} <small>kg CO₂</small>`;
  $("requiredReduction").textContent=`${fmt(reduction,0)} kg`;
  $("monthlyBudget").textContent=`${fmt(monthly,0)} kg`;
  $("baselineLabel").textContent=fmt(baseline,0);$("targetLabel").textContent=fmt(budget,0);
  $("targetBar").style.width=`${100-target}%`;
  $("plannerInsight").textContent=`Reduce emissions by ${fmt(reduction,0)} kg CO₂ over ${period} month${period===1?"":"s"}. The average allowable emissions budget is ${fmt(monthly,0)} kg CO₂ per month; review actuals regularly.`;
  if(showMessage) showToast("Reduction budget recalculated.");
}
function collectState(){
  state.factors={}; MODES.forEach(m=>state.factors[m.key]=safeNum(`factor-${m.key}`,DEFAULT_FACTORS[m.key]));
  state.compareDistance=safeNum("compareDistance",800);state.compareWeight=safeNum("compareWeight",5);state.compareCost=safeNum("compareCost",1);
  state.baseline=safeNum("baseline",42800);state.target=parseInt($("reductionTarget").value,10);state.period=parseInt($("period").value,10);
  state.vehicleMode=$("vehicleMode").value;state.distance=safeNum("distance",250);state.consumption=safeNum("consumption",32);state.factor=safeNum("factor",2.68);
  state.lastCalculation={emissions:safeNum("consumption")*safeNum("factor"),perKm:safeNum("distance")?safeNum("consumption")*safeNum("factor")/safeNum("distance"):0,energy:safeNum("consumption"),unit:$("energyUnit").textContent,factor:safeNum("factor"),mode:$("vehicleMode").value};
  return state;
}
function applyState(saved){
  if(!saved)return;
  state={...structuredCloneSafe(DEFAULT_STATE),...saved,factors:{...DEFAULT_FACTORS,...(saved.factors||{})}};
  $("compareDistance").value=state.compareDistance;$("compareWeight").value=state.compareWeight;$("compareCost").value=state.compareCost;
  $("baseline").value=state.baseline;$("reductionTarget").value=state.target;$("period").value=state.period;
  $("vehicleMode").value=state.vehicleMode;
  const units={diesel:{unit:"L",factorUnit:"kg CO₂ / L"},petrol:{unit:"L",factorUnit:"kg CO₂ / L"},cng:{unit:"kg",factorUnit:"kg CO₂ / kg"},electricity:{unit:"kWh",factorUnit:"kg CO₂ / kWh"}};
  $("energyUnit").textContent=units[state.vehicleMode].unit;$("factorUnit").textContent=units[state.vehicleMode].factorUnit;
  $("distance").value=state.distance;$("consumption").value=state.consumption;$("factor").value=state.factor;
  renderFactorEditors();
  calculateCarbon(false);renderComparison();calculatePlanner(false);
}
function saveWorkspace(){
  collectState();
  try{localStorage.setItem("carbonwise-workspace-v1",JSON.stringify(state));showToast("Workspace saved in this browser.");}
  catch(e){showToast("Could not save in this browser. You can still use the tools.");}
}
function resetWorkspace(){
  if(!confirm("Reset CarbonWise to the original demo assumptions and targets? This will replace the current workspace."))return;
  state=structuredCloneSafe(DEFAULT_STATE);
  applyState(state);
  try{localStorage.removeItem("carbonwise-workspace-v1");}catch(e){}
  showToast("Demo settings restored.");
}
function generatePDF(){
  const data=collectState();
  const modeRows=MODES.map(m=>({
    name:m.name,
    emissions:data.compareDistance*data.compareWeight*data.factors[m.key],
    cost:data.compareDistance*data.compareWeight*m.cost*data.compareCost,
    factor:data.factors[m.key]
  }));
  const baseline=data.baseline, target=data.target;
  const budget=baseline*(1-target/100), reduction=baseline-budget;
  const lines = [
    "CARBONWISE - MEASURE. COMPARE. REDUCE.",
    "EXECUTIVE SUSTAINABILITY SUMMARY",
    "GreenHaul Logistics | Generated " + new Date().toLocaleDateString("en-IN"),
    "Illustrative demo data - not audited or verified carrier data",
    "",
    "KEY TRIP ESTIMATE",
    "Estimated trip emissions: " + fmt(data.lastCalculation.emissions,2) + " kg CO2",
    "Energy used: " + fmt(data.lastCalculation.energy,2) + " " + data.lastCalculation.unit,
    "Emission factor: " + fmt(data.lastCalculation.factor,3) + " kg CO2 per " + data.lastCalculation.unit,
    "",
    "TRANSPORT MODE COMPARISON",
    "Mode | Factor (kg CO2/tonne-km) | Emissions (kg CO2) | Indicative cost (INR)"
  ];
  modeRows.forEach(r => lines.push(r.name + " | " + fmt(r.factor,3) + " | " + fmt(r.emissions,1) + " | " + fmt(r.cost,0)));
  lines.push(
    "",
    "REDUCTION TARGET",
    "Baseline emissions: " + fmt(baseline,0) + " kg CO2",
    "Target reduction: " + target + "%",
    "Target emissions budget: " + fmt(budget,0) + " kg CO2",
    "Required reduction: " + fmt(reduction,0) + " kg CO2",
    "Average monthly budget: " + fmt(data.period>0?budget/data.period:budget,0) + " kg CO2",
    "",
    "MANAGEMENT RECOMMENDATION",
    "Validate factors against an appropriate reporting standard, prioritise material emission sources,",
    "and review actual emissions against the target every month.",
    "",
    "Method: vehicle estimate = energy consumed x emission factor.",
    "Freight estimate = distance x shipment weight x factor (kg CO2/tonne-km).",
    "All factors, costs and mode comparisons are illustrative assumptions."
  );
  const ascii = s => String(s).replace(/[^\x20-\x7E]/g, ch => ({"–":"-","—":"-","×":"x","₹":"INR","₂":"2","’":"'","→":"->"}[ch] || ""));
  const esc = s => ascii(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
  const commands = [
    "q 0.09 0.42 0.27 rg 0 790 595 52 re f Q",
    "BT /F1 18 Tf 1 1 1 rg 42 815 Td (CarbonWise) Tj ET",
    "BT /F1 9 Tf 1 1 1 rg 42 800 Td (Measure. Compare. Reduce.) Tj ET"
  ];
  let y=765;
  lines.forEach((line,index)=>{
    if(y<40 || line==="") { if(line==="") y-=7; return; }
    const heading = ["CARBONWISE - MEASURE. COMPARE. REDUCE.","EXECUTIVE SUSTAINABILITY SUMMARY","KEY TRIP ESTIMATE","TRANSPORT MODE COMPARISON","REDUCTION TARGET","MANAGEMENT RECOMMENDATION"].includes(line);
    const size=heading?10:8;
    const color=heading?"0.09 0.42 0.27":"0.12 0.16 0.14";
    commands.push(`BT /F1 ${size} Tf ${color} rg 48 ${y} Td (${esc(line).slice(0,115)}) Tj ET`);
    y-=heading?17:13;
  });
  const stream=commands.join("\n")+"\n";
  const objects=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}endstream`
  ];
  let pdf="%PDF-1.4\n"; const offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(new TextEncoder().encode(pdf).length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
  const xrefOffset=new TextEncoder().encode(pdf).length;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<offsets.length;i++) pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const blob=new Blob([pdf],{type:"application/pdf"}), url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download="CarbonWise-Executive-Sustainability-Report.pdf";
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  showToast("Your executive PDF report has been downloaded.");
}
function init(){
  renderTrendChart();renderModeBars();renderFactorEditors();renderComparison();calculatePlanner(false);calculateCarbon(false);
  try{const saved=localStorage.getItem("carbonwise-workspace-v1");if(saved)applyState(JSON.parse(saved));}catch(e){}
  $("vehicleMode").addEventListener("change",updateEnergyFields);
  $("calculatorForm").addEventListener("submit",e=>{e.preventDefault();calculateCarbon(true);});
  ["distance","consumption","factor"].forEach(id=>$(id).addEventListener("input",()=>calculateCarbon(false)));
  $("calcReset").addEventListener("click",()=>{const mode=$("vehicleMode").value;const defaults={diesel:[250,32,2.68],petrol:[250,30,2.31],cng:[250,18,2.75],electricity:[250,48,.71]}[mode];$("distance").value=defaults[0];$("consumption").value=defaults[1];$("factor").value=defaults[2];calculateCarbon(false);showToast("Calculator inputs reset.");});
  $("compareBtn").addEventListener("click",()=>{renderComparison();showToast("Transport comparison updated.");});
  ["compareDistance","compareWeight","compareCost"].forEach(id=>$(id).addEventListener("change",renderComparison));
  $("resetFactors").addEventListener("click",()=>{state.factors={...DEFAULT_FACTORS};renderFactorEditors();renderComparison();showToast("Default comparison factors restored.");});
  $("plannerForm").addEventListener("submit",e=>{e.preventDefault();calculatePlanner(true);});
  ["baseline","reductionTarget","period"].forEach(id=>$(id).addEventListener("input",()=>calculatePlanner(false)));
  $("saveBtn").addEventListener("click",saveWorkspace);$("resetBtn").addEventListener("click",resetWorkspace);$("pdfBtn").addEventListener("click",generatePDF);
  $("contactForm").addEventListener("submit",e=>{e.preventDefault();const name=$("contactName").value.trim();const email=$("contactEmail").value.trim();const message=$("message").value.trim();if(!name||!email||!message)return;$("contactFeedback").textContent=`Demo preview ready for ${name}. No message was sent. In a live deployment, connect this form to a secure form service or backend.`;showToast("Enquiry preview created; nothing was sent.");});
  const toggle=$("menuToggle"),nav=$("mainNav");
  toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");}));
  const links=[...document.querySelectorAll(".nav-link")];
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id));}});},{rootMargin:"-25% 0px -65% 0px"});
  document.querySelectorAll("main section[id]").forEach(section=>observer.observe(section));
}
document.addEventListener("DOMContentLoaded",()=>{
  try { init(); }
  catch(error) {
    console.error("CarbonWise initialization failed:", error);
    const toast=document.getElementById("toast");
    if(toast){toast.textContent="A tool could not start. Refresh the page; if the issue continues, check that script.js was uploaded to the repository root.";toast.classList.add("show");}
  }
});
