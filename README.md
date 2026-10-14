# CarbonWise — Simple Website

A one-page demo for GreenHaul Logistics, a fictional business. Sections: Home, Calculator, Dashboard, About, Contact.

## Files
- `index.html`: content and embedded logo
- `style.css`: responsive design
- `script.js`: one vehicle carbon calculator, navigation, contact preview, print/PDF action

## Calculator
Estimated emissions (kg CO₂) = fuel or electricity consumed × emission factor. Distance is also used to calculate emissions per kilometre.

Illustrative defaults only:
- Diesel: 2.68 kg CO₂/litre
- Petrol: 2.31 kg CO₂/litre
- CNG: 2.75 kg CO₂/kg
- Electricity: 0.716 kg CO₂/kWh

These values are illustrative, not certified reporting factors. Verify appropriate factors before formal use.

## PDF
Click “Print / Save report as PDF”. In the browser print dialog, choose “Save as PDF”. No external PDF library is used.

## Contact form
The form only displays a local preview. It does not send or store messages.

## Dashboard
The dashboard contains static illustrative sample KPIs and a chart; it is not connected to live data.

## Update your GitHub Pages site
1. Extract this ZIP.
2. Upload `index.html`, `style.css`, and `script.js` directly into the root of your existing repository, replacing the old files.
3. Commit the changes.
4. Under GitHub repository **Settings → Pages**, use **Deploy from a branch**, branch `main`, folder `/(root)`.
5. Wait for deployment and hard-refresh the website (Cmd+Shift+R on Mac).
