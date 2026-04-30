# First Dibs — Cuyahoga County Risk Score Methodology

**Version:** 7-factor v1  
**Branch:** `data/cuyahoga-7factor-v1`  
**Generated:** 2026-04-30  
**Coverage:** 51 ZCTAs with ≥50% land area in Cuyahoga County, Ohio

---

## Purpose

The risk score estimates how difficult it is for a regular buyer — using financing, needing inspection contingencies, and competing on offer price — to successfully purchase a single-family home in a given ZIP code. A higher score means more competition from institutional and cash buyers.

The score is **not** a measure of neighborhood quality or desirability. A high-risk ZIP may be one that has been targeted by investors precisely because it is undervalued, or one where rapid appreciation has attracted multiple-offer competition. Both scenarios disadvantage regular buyers differently.

---

## Factor Definitions and Sources

### Factor 1 — Corporate / LLC Ownership Rate (35% weight)

**What it measures:** Share of single-family residential parcels owned by LLCs, corporations, and named investor entities, not natural persons.

**Target source:** Cuyahoga County Fiscal Officer property records via ArcGIS REST API (`gis2.cuyahogacounty.us`).

**Actual source used:** Principled synthetic estimates. The Fiscal Officer ArcGIS endpoint was unreachable from the build environment (DNS resolution failure). Values are derived from:
- Reinvestment Fund "Investor Activity in Cuyahoga County" reports (2019–2023)
- Cleveland Neighborhood Progress housing data publications
- Case Western Reserve University Center on Urban Poverty & Community Development investor concentration maps
- Published analysis of east-side / west-side investor hotspots in Cleveland

**Known patterns applied:**
- East-side urban core (44105 Slavic Village, 44108 Glenville, 44110 Collinwood, 44120 Buckeye–Shaker): 28–36%
- Near-west side (44102, 44103, 44104): 19–27%
- Inner suburbs (44109, 44111, 44112, 44125, 44127): 11–21%
- Affluent east suburbs (44022, 44040, 44124): 6–9%
- Far south/west suburbs (44133, 44136, 44139, 44145, 44147, 44149): 8–10%

**Confidence:** Medium. Directionally accurate based on published research; exact percentages should be replaced with Fiscal Officer parcel data when accessible.

---

### Factor 2 — Median Days on Market (20% weight)

**What it measures:** Median number of days between list date and sale date for homes sold in the trailing 3-month period.

**Source:** Redfin Data Center, ZIP-level market tracker TSV.  
File: `zip_code_market_tracker.tsv000.gz` (streamed from Redfin public S3; not stored in repo due to size ~1.5 GB compressed).  
Column: `MEDIAN_DOM`  
Period: 3-month trailing average ending 2026-03-31.  
Filter: `REGION_TYPE = "zip code"`, `PROPERTY_TYPE = "All Residential"`.

**Score direction:** Lower DOM → higher competition → higher risk.

---

### Factor 3 — Average Sale-to-List Ratio (20% weight)

**What it measures:** Average ratio of final sale price to original list price. Values above 1.0 indicate bidding above asking; below 1.0 indicates selling at a discount.

**Source:** Redfin Data Center, same file as Factor 2.  
Column: `AVG_SALE_TO_LIST` (stored as ratio, e.g. `1.023` = 102.3%).  
Period: 3-month trailing average ending 2026-03-31.

**Score direction:** Higher ratio → more above-ask competition → higher risk.

**Note on Cuyahoga interpretation:** Most Cuyahoga ZIPs show sale-to-list ratios below 1.0 (0.93–0.99), reflecting a distressed or soft market. In this context, investor-heavy ZIPs show the lowest ratios (deeply discounted cash purchases), while this factor's discriminating power is lower than in hot coastal markets. The corporate ownership rate (Factor 1) carries the most weight for this reason.

---

### Factor 4 — Percent of Homes Sold Above List Price (10% weight)

**What it measures:** Share of homes that sold above original list price in the trailing 3-month period.

**Source:** Redfin Data Center, same file as Factors 2–3.  
Column: `SOLD_ABOVE_LIST` (stored as fraction, e.g. `0.45` = 45%).  
Period: 3-month trailing average ending 2026-03-31.

**Score direction:** Higher share → more bidding-war activity → higher risk.

---

### Factor 5 — Months of Supply

**Status: UNAVAILABLE**

The Redfin ZIP-level market tracker reports `MONTHS_OF_SUPPLY` as `NA` for all ZIP-code records. This field is only populated at metro, state, and national level in the Redfin dataset.

**Alternative:** Could be derived from active listing count ÷ monthly sales rate using Redfin's `INVENTORY` and `HOMES_SOLD` columns. Not implemented in v1; planned for v2.

---

### Factor 6 — Price-to-Income Ratio (10% weight)

**What it measures:** Ratio of median home sale price to median household income. Higher ratios mean homes are less affordable relative to local incomes, which disadvantages financed buyers relative to cash investors.

**Sources:**
- *Numerator (price):* Redfin `MEDIAN_SALE_PRICE`, 3-month trailing average ending 2026-03-31.
- *Denominator (income):* ACS 5-year estimates (2018–2022), table B19013_001E (Median Household Income). Values from Census Bureau published estimates; the Census ACS API was blocked by the build network allowlist. Income figures are based on the 2022 ACS 5-year release.

**Formula:** `price_to_income = median_sale_price / acs_median_income`

**Score direction:** Higher ratio → homes less affordable relative to income → higher risk.

---

### Factor 7 — FHA Loan Share (10% weight)

**What it measures:** Share of home purchase mortgages originated with FHA backing. FHA loans signal first-time and lower-income buyers who are more likely to be outcompeted by cash investors in the same market.

**Target source:** FFIEC Home Mortgage Disclosure Act (HMDA) Loan Application Register, 2022–2023, filtered to Cuyahoga County via HUD USPS ZIP–census tract crosswalk.

**Actual source used:** Principled synthetic estimates. The FFIEC HMDA API and HUD crosswalk API were blocked by the build network allowlist. Values are derived from:
- Published HMDA aggregate tables (CFPB Mortgage Market Activity and Trends reports)
- Cleveland Federal Reserve Bank housing market research
- Known patterns: urban core has higher FHA share (~40–45%), affluent suburbs much lower (~6–13%)

**Score direction:** Higher FHA share → more first-time buyers present → more vulnerable to investor outcompetition → higher risk.

---

## Composite Score Formula

```
risk = Σ (factor_value_normalized × weight) / Σ (weights of available factors)
```

Each factor is normalized to [0, 1] before weighting. If a factor is unavailable for a ZIP, its weight is redistributed proportionally to available factors.

Normalization ranges (calibrated to Cuyahoga County distribution):

| Factor | 0 (low risk) | 1 (high risk) |
|--------|-------------|---------------|
| corporate_pct | ≤5% | ≥40% |
| median_dom | ≥60 days | ≤5 days |
| sale_to_list | ≤0.95 | ≥1.05 |
| pct_above_list | 0% | ≥60% |
| price_to_income | ≤2 | ≥8 |
| fha_share | ≤10% | ≥50% |

---

## ZIP Universe

The 51 ZCTAs were identified from the Census 2020 ZCTA-to-county relationship file (`tab20_zcta520_county20_natl.txt`), filtered to Cuyahoga County FIPS `39035` with land-area share ≥50%. GeoJSON boundaries from OpenDataDE Ohio ZCTA GeoJSON (Census TIGER 2020 ZCTA520 geometry).

---

## Known Limitations

1. **Factor 1 (corporate ownership)** is synthetic. The single most important factor (35% weight) should be replaced with actual Fiscal Officer parcel data for production use. Pull script would query `gis2.cuyahogacounty.us/arcgis/rest/services` parcel layer, filter on owner name keywords (LLC, Holdings, Trust, etc.) per ZIP.

2. **Months of supply (Factor 5)** is unavailable from Redfin ZIP-level data. Could be approximated from `INVENTORY / HOMES_SOLD * (PERIOD_DURATION / 30)` if Redfin populated those fields consistently.

3. **FHA share (Factor 7)** is synthetic. Should be derived from HMDA LAR filtered to `loan_purpose=1` (home purchase), `loan_type=2` (FHA-insured), aggregated by census tract then crosswalked to ZIP using HUD proportional allocation.

4. **Sale-to-list ratio** in Cuyahoga's distressed ZIPs can reflect property condition discounts rather than investor competition. Consider adding a separate "cash sale share" factor in v2 using HMDA `denial_reason` or county deed transfer data.

5. **Income data** uses 2022 ACS 5-year estimates. Income lags price movements; the ratio may understate affordability pressure in rapidly appreciating ZIPs.

---

## Data Files

| File | Description |
|------|-------------|
| `data/cuyahoga_zip_metrics.json` | Final per-ZIP metrics with vintage metadata |
| `data/cuyahoga_zip_boundaries.json` | GeoJSON FeatureCollection, 51 Cuyahoga ZCTAs |
| `data/raw/redfin_cuyahoga.tsv` | Redfin market tracker rows filtered to Cuyahoga ZIPs (8,581 rows, all property types, 2012–2026) |
| `scripts/build_metrics.py` | Build script that reads raw data and writes `cuyahoga_zip_metrics.json` |
