# Toolkit & Counselor Link Check

Generated: 2026-05-03  
Environment: proxy-blocked (all external HTTPS returns HTTP 403)  
Status: **BLOCKED-PROXY — manual browser verification required before merge**

## Links in toolkit card (index.html)

| ID | Label | URL | Status |
|----|-------|-----|--------|
| toolkit-escalation | Escalation clause — Ohio REALTORS sample | https://www.ohiorealtors.org/wp-content/uploads/2022/01/OAR-Escalation-Addendum.pdf | BLOCKED-PROXY |
| toolkit-appraisal-gap | Appraisal gap — CFPB explainer | https://www.consumerfinance.gov/ask-cfpb/what-is-an-appraisal-contingency-en-169/ | BLOCKED-PROXY |
| toolkit-full-underwriting | Full underwriting — Fannie Mae credit FAQ | https://www.fanniemae.com/learning-center/homebuyers | BLOCKED-PROXY |
| toolkit-dpa | OHFA program overview | https://ohiohome.org/homebuyer/firsttimebuyer.aspx | BLOCKED-PROXY |
| toolkit-dpa | Cuyahoga DPA program | https://development.cuyahogacounty.gov/housing | BLOCKED-PROXY |
| toolkit-dpa | FHLB Welcome Home | https://www.fhlbcin.com/welcome-home | BLOCKED-PROXY |
| toolkit-counselor | HUD counselor search | https://apps.hud.gov/offices/hsg/sfh/hcc/hcs.cfm?webListAction=search&searchstate=OH | BLOCKED-PROXY |
| toolkit-counselor | ESOP Cleveland | https://www.esop-cleveland.org | BLOCKED-PROXY |
| toolkit-counselor | Famicos Foundation | https://www.famicos.org | BLOCKED-PROXY |
| toolkit-counselor | CHN Housing Partners | https://www.chnhousingpartners.org | BLOCKED-PROXY |

## Verification checklist (manual)

Before merging, open each URL in a browser and confirm:
- [ ] Page loads and displays expected content
- [ ] URL is not a redirect to a different page
- [ ] Content matches the link label in the toolkit
- [ ] HUD counselor search returns Ohio results

## Notes

- All URLs were constructed from official agency domains and known URL patterns
- The HUD counselor search URL is the standard CFPB-recommended deep link
- ESOP, Famicos, and CHN Housing Partners are HUD-approved agencies serving Cuyahoga County
- If any URL has changed, update the `href` attribute in the corresponding `<details>` element in `index.html`
