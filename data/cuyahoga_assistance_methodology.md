# Cuyahoga County Housing Assistance Programs — Methodology

**Generated:** 2026-05-02  
**Period:** 2023 activity (intended)  
**Coverage:** 51 Cuyahoga County ZIP codes  
**Output file:** `data/cuyahoga_assistance_programs.json`

---

## Summary

This dataset was intended to capture per-ZIP activity counts for 8 housing-assistance programs operating in Cuyahoga County. Every primary and secondary data source returned HTTP 403 from this environment. Program catalog metadata (terms, statewide totals where available, income limits) was captured from publicly accessible web search snippets. All per-ZIP activity values are null.

---

## Programs and Sourcing

### 1. FHA Originations  (`fha_originations`)

| Attribute | Value |
|-----------|-------|
| Source | HMDA LAR 2023, CFPB |
| Geography intended | ZIP (via tract→ZIP HUD USPS crosswalk, res_ratio weighted) |
| Filter | `loan_type=2`, `action_taken=1`, state=39, county=035 |
| Status | **UNAVAILABLE** — all endpoints returned 403 |

**Blocked URLs:**
- `https://ffiec.cfpb.gov/data/snapshot/nationwide/2023_lar.zip`
- `https://cfpb-hmda-public.s3.amazonaws.com/prod/snapshot-data/2023_lar.zip`

**Crosswalk also blocked:**
- `https://huduser.gov/portal/datasets/usps_crosswalk.html`

**Interpretation:** FHA-insured originations are a key affordability proxy. High counts relative to market volume indicate a neighborhood where buyers depend on low-down-payment financing, often correlated with first-time buyer activity.

---

### 2. VA Originations (`va_originations`)

| Attribute | Value |
|-----------|-------|
| Source | HMDA LAR 2023, CFPB |
| Geography intended | ZIP (via tract→ZIP HUD USPS crosswalk) |
| Filter | `loan_type=3`, `action_taken=1`, state=39, county=035 |
| Status | **UNAVAILABLE** — same as FHA |

**Interpretation:** VA loans indicate veteran/active-duty buyer activity. Clusters often reflect proximity to military installations or veteran communities.

---

### 3. Mortgage Denial Rate (`hmda_denial_rate`)

| Attribute | Value |
|-----------|-------|
| Source | HMDA LAR 2023, CFPB |
| Geography intended | ZIP (via tract→ZIP HUD USPS crosswalk) |
| Calculation | `(action_taken 3 or 5) / (action_taken 1 + 3 + 5)` for conventional purchase loans |
| Status | **UNAVAILABLE** — same as FHA |

**Interpretation:** High denial rates signal credit-access barriers. Disparate denial rates between neighborhoods can indicate redlining patterns or concentration of under-banked populations. This metric complements the competitive-risk score by highlighting where buyers face systemic hurdles even before entering a competitive market.

---

### 4. OHFA Assisted Loans (`ohfa_loans`)

| Attribute | Value |
|-----------|-------|
| Source | Ohio Housing Finance Agency Annual Report FY2024 |
| Geography intended | ZIP (from OHFA county/ZIP loan data appendix) |
| Status | **UNAVAILABLE** — `ohiohome.org` returned 403 |

**Statewide context (from web snippets):**
- FY2024: **6,664 borrowers** statewide, **>$1.3 billion** in mortgage volume
- Programs: Your Choice! (2.5% or 5% DPA), Grants for Grads, Ohio Heroes, Target Area

**Interpretation:** OHFA activity per ZIP measures uptake of state-subsidized homeownership assistance. Low uptake in high-risk ZIPs may suggest outreach gaps; high uptake indicates programs are reaching intended markets.

---

### 5. Cleveland HOME/CDBG DPA (`cleveland_home_dpa`)

| Attribute | Value |
|-----------|-------|
| Source | City of Cleveland CAPER (Consolidated Annual Performance and Evaluation Report) 2023–2024 |
| Period | June 1, 2023 – May 31, 2024 |
| Geography intended | ZIP (from CAPER appendix tables) |
| Status | **UNAVAILABLE** — PDF at `clevelandohio.gov` returned 403 |

**Interpretation:** HUD HOME and CDBG DPA activity is concentrated in low-to-moderate income (LMI) census tracts within Cleveland city limits. ZIP codes outside city boundaries (most of the 44xxx suburban ZIPs) would have zero activity.

---

### 6. Cuyahoga County DPA (`cuyahoga_dpa`)

| Attribute | Value |
|-----------|-------|
| Source | Cuyahoga County Department of Development |
| Geography intended | ZIP (from county loan activity database or public records) |
| Status | **UNAVAILABLE** — `cuyahogacounty.gov` returned 403 |

**Program terms (from web snippets):**
- Maximum assistance: **$20,900** or 10% of purchase price (whichever is less)
- Income limit: **80% AMI**
- Loan type: deferred, forgivable second mortgage (no monthly payments)
- Administrators: CHN Housing Capital, Believe Mortgage Services
- Requirements: primary residence, homebuyer education

**Interpretation:** The county DPA extends coverage to suburban ZIPs beyond Cleveland city limits. Mapping uptake would reveal whether assistance is reaching high-competition ZIPs where buyers need it most.

---

### 7. FHLB Welcome Home Grants (`fhlb_welcome_home`)

| Attribute | Value |
|-----------|-------|
| Source | FHLB Cincinnati Welcome Home Program 2023 |
| Geography intended | ZIP (from FHLB open-data award CSV, filtered to Ohio) |
| Status | **UNAVAILABLE** — `fhlbcin.com` returned 403 |

**Statewide context (from web snippets):**
- 2023 Ohio: **>1,600 households**, **>$16.3 million** in grants
- 2024 maximum grant: **$20,000** per household (highest in program history)
- Forgiven after 5 years of owner-occupancy

**Cuyahoga County 2024 income limits:**
- 1–2 person household: $75,200
- 3+ person household: $86,480

**Interpretation:** WHP grants are disbursed through member financial institutions, so coverage depends on which lenders are active in each ZIP. Uneven distribution may reflect lender footprint rather than need.

---

### 8. Land Bank Dispositions (`land_bank_dispositions`)

| Attribute | Value |
|-----------|-------|
| Source | Cuyahoga County Land Reutilization Corporation (CCLRC) 2023 |
| Geography intended | ZIP (geocoded from parcel address in transaction data) |
| Status | **UNAVAILABLE** — `thelandbank.org` and `data.clevelandohio.gov` returned 403 |

**Interpretation:** High land-bank activity (rehab sales, side-lot transfers) indicates neighborhoods with significant distressed-property recycling. These ZIPs may have artificially suppressed prices or unique inventory dynamics compared to the open market, which can affect risk-score interpretation.

---

### 9. Habitat for Humanity Activity (`habitat_activity`)

| Attribute | Value |
|-----------|-------|
| Source | Habitat for Humanity Greater Cleveland annual activity data |
| Geography intended | ZIP (from program activity report) |
| Status | **UNAVAILABLE** — `clevelandhabitat.org` returned 403 |

**Program context (from web snippets):**
- **400 Home Campaign (2023–2027):** 100 new builds, 50 rehabs, 250 critical repairs
- Geographic focus: **Buckeye-Woodhill corridor** (primarily ZIPs 44104 and 44120)
- Income target: 30–60% AMI
- Programs: zero-interest mortgage with sweat equity requirement; A Brush With Kindness exterior repairs

**Interpretation:** Habitat activity is heavily concentrated geographically. ZIPs with active Habitat programs may see unusual price dynamics due to below-market new construction entering inventory.

---

## Known Limitations

1. **All per-ZIP values are null.** The dataset is a program catalog shell. It documents intended methodology, blocked sources, and program metadata for future data population.

2. **Network access constraints.** All government, HUD, CFPB, OHFA, and municipal portals returned HTTP 403. This is a persistent environment-level constraint, not a temporary outage. Workarounds were exhausted.

3. **Statewide totals are not distributable to ZIPs.** OHFA and FHLB statewide figures cannot be apportioned to ZIPs without county or ZIP-level sub-totals, which are unavailable.

4. **Geography mismatch risk.** Several programs (CDBG, HOME DPA, Habitat) are legally bounded to LMI census tracts or Cleveland city limits. Many Cuyahoga County ZIPs would have legitimate zero values, not null values. Future work should distinguish "null = unknown" from "zero = ineligible."

5. **Data vintage.** All intended data is for calendar year 2023. OHFA uses a fiscal year (July–June); the FY2024 OHFA figures cited overlap with calendar 2023–2024.

---

## Future Data Collection Paths

To populate per-ZIP activity values:

| Program | Path |
|---------|------|
| FHA/VA/denial rate | Download HMDA LAR from CFPB API or bulk download outside proxy; join via HUD USPS crosswalk |
| OHFA | Contact OHFA directly (FOIA or open-data request) for county/ZIP loan counts |
| Cleveland CAPER | Request PDF directly from City of Cleveland or FOIA the appendix tables |
| Cuyahoga DPA | Submit public records request to Cuyahoga County Development Office |
| FHLB WHP | Access `fhlbcin.com/tools-resources/open-data/` outside proxy; filter to Ohio ZIPs |
| Land Bank | Request parcel transaction CSV from CCLRC or access `data.clevelandohio.gov` outside proxy |
| Habitat | Contact Habitat Greater Cleveland development staff for annual program summary by ZIP |
