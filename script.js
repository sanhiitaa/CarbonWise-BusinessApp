(() => {
'use strict';
const factors = {
 diesel:{value:2.68,unit:'litres',factorUnit:'kg CO₂/L',label:'Fuel consumed',hint:'Illustrative diesel factor. Verify it before formal reporting.'},
 petrol:{value:2.31,unit:'litres',factorUnit:'kg CO₂/L',label:'Fuel consumed',hint:'Illustrative petrol factor. Verify it before formal reporting.'},
 cng:{value:2.75,unit:'kg',factorUnit:'kg CO₂/kg',label:'CNG consumed',hint:'Illustrative CNG factor. Confirm the unit with your source.'},
 electricity:{value:0.716,unit:'kWh',factorUnit:'kg CO₂/kWh',label:'Electricity consumed',hint:'Illustrative electricity factor. Grid factors vary by location and year.'}
};
const $=id=>document.getElementById(id);
const energy=$('energy'), distance=$('distance'), consumption=$('consumption'), factor=$('factor');
function fmt(n,d=2){return Number(n).toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');window.setTimeout(()=>t.classList.remove('show'),2800);}
function calculate(e){
 if(e)e.preventDefault();
 const d=Number(distance.value),c=Number(consumption.value),f=Number(factor.value);
 if(!Number.isFinite(d)||d<=0||!Number.isFinite(c)||c<=0||!Number.isFinite(f)||f<0){toast('Enter a positive distance and consumption, and a non-negative emission factor.');return;}
 const emissions=c*f, item=factors[energy.value];
 $('emissions').textContent=fmt(emissions);
 $('distanceOut').textContent=fmt(d)+' km';
 $('energyOut').textContent=fmt(c)+' '+item.unit;
 $('perKm').textContent=fmt(emissions/d,4)+' kg/km';
}
function energyChanged(){
 const item=factors[energy.value];
 $('consLabel').textContent=item.label;
 $('consUnit').textContent=item.unit;
 $('factorUnit').textContent=item.factorUnit;
 $('factorHint').textContent=item.hint;
 factor.value=item.value;
 calculate();
}
function reset(){energy.value='diesel';distance.value=100;consumption.value=10;energyChanged();}
function printReport(){
 const d=Number(distance.value), c=Number(consumption.value), f=Number(factor.value);
 if(!Number.isFinite(d)||d<=0||!Number.isFinite(c)||c<=0||!Number.isFinite(f)||f<0){
   toast('Enter a positive distance and consumption, and a non-negative emission factor.');
   return;
 }
 const item=factors[energy.value];
 const emissions=c*f;
 const energyName=energy.options[energy.selectedIndex].text;
 const reportWindow=window.open('','_blank','width=800,height=700');
 if(!reportWindow){
   toast('Your browser blocked the report window. Allow pop-ups for this site and try again.');
   return;
 }
 const safeDate=new Date().toLocaleString('en-IN');
 const reportHtml=`<!doctype html><html lang="en"><head><meta charset="utf-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <title>CarbonWise Vehicle Carbon Footprint Report</title>
 <style>
 body{font:14px/1.55 Arial,sans-serif;color:#111;max-width:760px;margin:36px auto;padding:0 24px}
 h1{font-size:24px;margin:0 0 4px;color:#176b45}h2{font-size:16px;margin:24px 0 8px}
 .muted{color:#555;font-size:12px}.result{border:1px solid #bbb;padding:16px;margin:18px 0}
 .result strong{font-size:25px;display:block;margin:4px 0;color:#176b45}
 table{border-collapse:collapse;width:100%;margin:8px 0 16px}th,td{border:1px solid #ccc;padding:9px;text-align:left}
 th{width:42%;background:#f2f7f3}button{padding:10px 16px;border:0;border-radius:6px;background:#176b45;color:#fff;font-weight:bold;cursor:pointer}
 .actions{margin:22px 0}.note{border-top:1px solid #ccc;padding-top:12px;font-size:11px;color:#444}
 @media print{body{margin:0 auto;padding:0 8px}.actions{display:none!important}h2{break-after:avoid}table,.result{break-inside:avoid}}
 </style></head><body>
 <h1>CarbonWise</h1><p class="muted">Vehicle Carbon Footprint Report · Generated ${safeDate}</p>
 <p>This report contains the values entered in the calculator and the resulting estimate.</p>
 <div class="result"><span>Estimated emissions</span><strong>${fmt(emissions)} kg CO₂</strong><span>${fmt(emissions/d,4)} kg CO₂ per kilometre</span></div>
 <h2>Inputs</h2><table><tbody>
 <tr><th>Energy type</th><td>${energyName}</td></tr>
 <tr><th>Distance travelled</th><td>${fmt(d)} km</td></tr>
 <tr><th>Fuel / electricity consumed</th><td>${fmt(c)} ${item.unit}</td></tr>
 <tr><th>Emission factor entered</th><td>${fmt(f,4)} ${item.factorUnit}</td></tr>
 </tbody></table>
 <h2>Calculation</h2>
 <p>Estimated emissions = consumption × emission factor</p>
 <p>${fmt(c)} ${item.unit} × ${fmt(f,4)} ${item.factorUnit} = <b>${fmt(emissions)} kg CO₂</b></p>
 <p>Emissions per kilometre = ${fmt(emissions)} kg CO₂ ÷ ${fmt(d)} km = <b>${fmt(emissions/d,4)} kg CO₂/km</b></p>
 <p class="note">Note: This is an estimate based on the entered values. Default emission factors are illustrative and have not been independently verified. For formal reporting, use a suitable verified factor for the energy source, location, and reporting year.</p>
 <div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div>
 <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));</script>
 </body></html>`;
 reportWindow.document.open();
 reportWindow.document.write(reportHtml);
 reportWindow.document.close();
}
function contactPreview(e){
 e.preventDefault();
 const name=$('name').value.trim();
 if(!name||!$('email').value.trim()||!$('message').value.trim()){ $('contactStatus').textContent='Please complete your name, email, and message.';return;}
 $('contactStatus').textContent=`Thanks, ${name}. Your enquiry is ready for review but has not been sent. This demo does not transmit or store messages.`;
 toast('Enquiry preview ready. Nothing was sent.');
}
document.addEventListener('DOMContentLoaded',()=>{
 $('year').textContent=new Date().getFullYear();
 energy.addEventListener('change',energyChanged);
 $('calcForm').addEventListener('submit',calculate);
 $('reset').addEventListener('click',reset);
 $('pdf').addEventListener('click',printReport);
 $('contactForm').addEventListener('submit',contactPreview);
 const nav=$('nav'),menu=$('menu');
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Toggle navigation');});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
 energyChanged();
});
})();