# CarbonWise — Measure. Compare. Reduce.

CarbonWise is a single-page sustainable logistics business-app prototype for an ITBT live class assignment. It uses a fictional Indian logistics company, GreenHaul Logistics, and illustrative demo data.

## Features

- Marketing-first landing page and required Home, About, Services, Dashboard, and Contact sections
- Responsive layout with navigation links to each interactive tool
- Sample management dashboard with KPI cards, an emissions trend chart, and emissions-by-mode visualisation
- Vehicle carbon calculator using distance, energy consumption, and an editable emission factor
- Transport comparison for road, rail, sea, air, and electric vehicles with editable illustrative factors
- Target-based carbon reduction planner
- Save/reset workspace using browser local storage
- Executive PDF sustainability report
- Demo enquiry form that previews the message locally and does not transmit it
- Useful external links to sustainability and transport resources

## Files

- `index.html` — website content and page structure
- `style.css` — colours, layout, responsive styling
- `script.js` — calculators, charts, local saving, comparison and PDF export
- The CarbonWise brand mark is embedded directly in `index.html`, so a separate image upload is not required.

## Run locally

1. Keep all files and the `images` folder together.
2. Open `index.html` in a modern browser.
3. For best results, use a local web server or GitHub Pages. The PDF export is generated directly in the browser and does not depend on a third-party PDF library.

## Publish with GitHub Pages

1. Sign in to GitHub and choose **New repository**.
2. Name it `CarbonWise-BusinessApp` (or another available name).
3. For a class assignment, a Public repository is the simplest option.
4. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the complete `images` folder. Do not upload only the HTML file.
5. In the repository, open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch `main` and folder `/ (root)`, then click **Save**.
8. Wait for the deployment to complete. GitHub will show the published URL on the Pages settings screen. It usually looks like `https://YOUR-USERNAME.github.io/CarbonWise-BusinessApp/`.
9. Open the live URL and test the navigation, calculator, comparison, reduction planner, save/reset controls, and PDF export.

## Important methodology note

The sample dashboard data, transport-mode emission factors, indicative cost rates, and transit-time estimates are illustrative assumptions for a classroom prototype. They are not official emission factors, live carrier quotes, or audited carbon-accounting results. The vehicle calculator uses:

`Estimated operational emissions (kg CO₂) = energy consumed × emission factor`

The transport comparison uses:

`Estimated emissions (kg CO₂) = distance (km) × shipment weight (tonnes) × emission factor (kg CO₂ / tonne-km)`

For real-world use, replace demo assumptions with factors and boundaries appropriate to the chosen reporting standard and activity data. Electric-vehicle estimates depend on the electricity mix and charging losses.

## Contact form limitation

The enquiry form demonstrates client-side validation and a local preview only. It does not send or store submissions on a server. A live business deployment would need a form service or backend.

## Browser storage

The Save workspace control stores settings in local storage on the current browser/device. It does not sync between devices or provide a cloud backup. Reset demo restores the original assumptions.


## Troubleshooting the fixed version

Replace the existing `index.html`, `style.css`, `script.js`, and `README.md` with the versions in this package. Upload them to the repository root (the same level as one another), then commit changes. The brand mark is embedded in HTML, and PDF generation no longer depends on a third-party CDN. After the commit, wait for GitHub Pages to redeploy, then hard-refresh the live page (Cmd+Shift+R on Mac; Ctrl+Shift+R on Windows/Linux).
