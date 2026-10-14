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
  calculate();
  const item=factors[energy.value];
  const d=Number(distance.value), c=Number(consumption.value), f=Number(factor.value);
  if(!Number.isFinite(d)||d<=0||!Number.isFinite(c)||c<=0||!Number.isFinite(f)||f<0)return;
  const emissions=c*f;
  const area=$('printReportArea');
  area.innerHTML = `
    <h1>CarbonWise</h1>
    <p class="print-subtitle">Vehicle Carbon Footprint Report · Generated ${new Date().toLocaleString('en-IN')}</p>
    <p>This report summarises the inputs and estimate calculated in the CarbonWise vehicle calculator.</p>
    <div class="print-result"><p>Estimated emissions</p><strong>${fmt(emissions)} kg CO₂</strong><p>${fmt(emissions/d,4)} kg CO₂ per kilometre</p></div>
    <h2>Calculation inputs</h2>
    <table><tbody>
      <tr><th>Energy type</th><td>${item.label==='CNG consumed'?'CNG':energy.options[energy.selectedIndex].text}</td></tr>
      <tr><th>Distance travelled</th><td>${fmt(d)} km</td></tr>
      <tr><th>Energy consumed</th><td>${fmt(c)} ${item.unit}</td></tr>
      <tr><th>Emission factor</th><td>${fmt(f,4)} ${item.factorUnit}</td></tr>
    </tbody></table>
    <h2>Calculation</h2>
    <p><b>Estimated emissions = energy consumed × emission factor</b></p>
    <p>${fmt(c)} ${item.unit} × ${fmt(f,4)} ${item.factorUnit} = <b>${fmt(emissions)} kg CO₂</b></p>
    <p>Emissions per kilometre = ${fmt(emissions)} kg CO₂ ÷ ${fmt(d)} km = <b>${fmt(emissions/d,4)} kg CO₂/km</b></p>
    <p class="print-note">Important: This is an estimate based on the values entered by the user. The default emission factors are illustrative and have not been independently verified. For formal reporting, confirm the appropriate factor for the energy source, location, and reporting year.</p>`;
  window.print();
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