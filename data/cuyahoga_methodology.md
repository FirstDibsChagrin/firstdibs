# Cuyahoga County ZIP Risk Factor Methodology

**Version:** 7-factor v1  
**Branch:** `data/cuyahoga-7factor-v1`  
**Generated:** 2026-04-30 (Factor 6 updated 2026-05-01)  
**Coverage:** 51 Cuyahoga County ZCTAs

---

## Factors Not Found (Completely Unobtainable)

The following factors could not be populated because the required data sources were blocked by the network proxy. Only `github.com`, `raw.githubusercontent.com`, and the Redfin public S3 bucket (`redfin-public-data.s3.us-west-2.amazonaws.com`) were accessible. All government API endpoints returned HTTP 403 ("Host not in allowlist").

| Factor | Source | Reason Null |
|--------|--------|-------------|
| **Factor 1: Corporate/LLC ownership %** | Cuyahoga County Fiscal Officer ArcGIS (`gis.cuyahogacounty.us`) | Host blocked by proxy allowlist |
| **Factor 7: FHA loan share** | FFIEC HMDA 2023 snapshot (`ffiec.cfpb.gov`); CFPB S3 (`cfpb-hmda-public.s3.amazonaws.com`) returns Access Denied | Host blocked; S3 bucket returns 403 |

**Factor 6 (price-to-income) was computed via workaround** — see Factor 6 section for details.

**Sanity check for corporate_pct** (affluent east ZIPs 44022, 44040, 44124 vs. high-investor ZIPs 44105, 44108, 44110, 44120): Cannot be performed — corporate_pct is null for all ZIPs.

---

## Purpose

The risk score estimates how difficult it is for a regular buyer — using financing, needing inspection contingencies, and competing on offer price — to successfully purchase a single-family home in a given ZIP code. A higher score means more competition from institutional and cash buyers.

---

## ZIP Universe

**Source:** `scpike/us-state-county-zip` on GitHub (based on US Census 2000 ZCTA geography)  
**URL:** https://raw.githubusercontent.com/scpike/us-state-county-zip/master/geo-data.csv  
**Downloaded:** 2026-04-30  
**Filter:** Rows where `county == "Cuyahoga"` and `state == "OH"` and ZIP is a valid 5-digit code → 51 ZCTAs

**Caveat:** The authoritative 2020 Census ZCTA-to-county relationship file (`tab20_zcta520_county20_natl.txt` from `www2.census.gov`) was inaccessible. The scpike dataset uses 2000 Census ZCTA geography and does not apply the >50% Cuyahoga land-area share filter required by the original methodology. Boundary ZIPs (e.g., 44040 Gates Mills, 44022 Chagrin Falls) may have changed county assignments since 2000. The 51 ZIPs here match the known Cuyahoga ZCTA list.

---

## Factor 1: Corporate/LLC Ownership Share

**Status: INACCESSIBLE — null for all 51 ZIPs after exhausting all four paths**  
**Detailed attempt log:** `data/raw/llc_sourcing_attempts.md`

### What was tried (Paths A–D, 2026-05-01)

**Path A (ArcGIS REST FeatureServer):** All ArcGIS-related domains blocked — `gis.cuyahogacounty.us`, `data-cuyahoga.opendata.arcgis.com`, `services.arcgis.com` (all subdomains), `hub.arcgis.com`, `opendata.arcgis.com`, ArcGIS S3 CDN, and the county's ArcGIS Online org (`cuyahogacounty.maps.arcgis.com`). The City of Cleveland GitHub notebook (`City-of-Cleveland/open-data-examples`, "02-County Property Data - Corporate Owners by Neighborhood.ipynb") confirms the dataset exists at ArcGIS item `a84be47945564300a2119f6b9a411d59` (Cleveland-only) with field `deeded_owner` — but the download endpoint `opendata.arcgis.com/api/v3/datasets/…` is blocked.

**Path B (Fiscal Officer bulk / NEOCANDO):** `fiscalofficer.cuyahogacounty.us` and `neocando.case.edu` both blocked.

**Path C (Cleveland rental registry / open data):** `data.clevelandohio.gov` and all city portal subdomains blocked.

**Path D (Published reports):** All report hosts blocked — wrlandconservancy.org, clevelandfed.org, signalohio.org, gao.gov, case.edu/socialwork, all regional public radio outlets. No GitHub repo found with committed parcel-level data. Web search snippets yielded only county/tract-level aggregates (not usable per the no-interpolation rule): hotspot-tract average 27% investor-owned SFHs in 2024; east-side Cleveland historically Black neighborhoods >46% sales to business entities; county-wide ~21% as of 2020.

**Path D5 (Ohio state GIS):** geodata.ohio.gov, OGRIP, and all Ohio state GIS servers blocked.

### To obtain this data in a future refresh

Run the City of Cleveland's open notebook from a normal network:
```
https://github.com/City-of-Cleveland/open-data-examples
  → 02-County Property Data - Corporate Owners by Neighborhood.ipynb
```
For full-county (not just Cleveland-city) data, use ArcGIS item `8bff3524ed374480b8c6ebb1b237b6b3` ("Parcels with Real Property CAMA") via:
```
https://opendata.arcgis.com/api/v3/datasets/8bff3524ed374480b8c6ebb1b237b6b3_0/downloads/data?format=csv&where=1%3D1
```
Apply the LLC regex from the original methodology, group by site-address ZIP, exclude government/land-bank owners, and compute `corporate_pct`.

### Intended methodology (for documentation)
- Source: Cuyahoga County Fiscal Officer parcel data via ArcGIS FeatureServer
- Field: `DEEDED_OWNER` (or `OWNER1` / `OWNER_NAME` depending on layer)
- Residential filter: Cuyahoga 500-series land-use class codes (single family, 2-family, 3-family, condo, apartment)
- Corporate regex (case-insensitive): `\b(LLC|L\.L\.C\.|LIMITED LIABILITY|INC\b|INCORPORATED|CORP\b|CORPORATION|HOLDINGS|REALTY|PROPERTIES|VENTURES|INVESTMENTS|CAPITAL|EQUITY|FUND|PARTNERS|LP|L\.P\.|LLP|REIT)\b`
- Exclude from numerator and denominator: names containing `CUYAHOGA LAND BANK`, `CITY OF CLEVELAND`, `CMHA`, `HUD`, `STATE OF OHIO`, `COUNTY OF CUYAHOGA`, `LAND BANK`, `HOUSING AUTHORITY`, `RECONSTRUCTION`
- Exclude from corporate flag: names containing `FAMILY TRUST`, `LIVING TRUST`, `REVOCABLE TRUST`, or `TRUSTEE` followed by personal-name pattern
- Formula: `corporate_pct = corporate_parcels / total_residential_parcels_excluding_govt × 100` (rounded to 1 decimal)
- Aggregate by site-address ZIP, not mailing ZIP

**ZIPs with null corporate_pct:** All 51.

---

## Factors 2–5: Redfin Market Data (REAL DATA)

**Source:** Redfin Data Center — ZIP Code Market Tracker  
**URL:** https://redfin-public-data.s3.us-west-2.amazonaws.com/redfin_market_tracker/zip_code_market_tracker.tsv000.gz  
**Downloaded:** 2026-04-30 (streamed via `curl | gunzip | grep`; filtered rows saved to `data/raw/redfin_cuyahoga.tsv`, 32,065 rows)  
**Vintage:** Rolling 90-day period; most ZIPs use period ending **2026-03-31**

**Methodology:**
1. Streamed the gzipped TSV and extracted rows matching Cuyahoga ZIPs using regex on REGION column
2. Filtered to `PROPERTY_TYPE == "All Residential"`
3. For each ZIP, selected the most recent period with non-null `HOMES_SOLD`
4. ZIPs with `HOMES_SOLD < 10` in latest period flagged as `low_sample_market: true` and use trailing 3-month median instead
5. Low-sample ZIPs (used trailing 3-month median): 44040 (Gates Mills), 44114 (Downtown/Near East), 44115 (Midtown), 44127 (Corlett)

### Factor 2: Median Days on Market (`median_dom`)

**Column:** `MEDIAN_DOM`  
**Unit:** days (rolling 90-day median for sold homes)  
**Formula:** Direct from Redfin; trailing 3-month median for low-sample ZIPs  
**ZIPs with null:** None — all 51 have real data  
**Score direction:** Lower DOM → more competition → higher risk

### Factor 3: Sale-to-List Ratio (`sale_to_list`)

**Column:** `AVG_SALE_TO_LIST`  
**Unit:** decimal ratio (1.012 = 1.2% above list; 0.960 = 4% below list)  
**Formula:** Direct from Redfin; trailing 3-month median for low-sample ZIPs  
**ZIPs with null:** None — all 51 have real data  
**Score direction:** Higher ratio → more above-ask competition → higher risk

**Note:** Most Cuyahoga ZIPs show sale-to-list ratios below 1.0 (range: ~0.91–1.03 as of March 2026), reflecting a soft market in many neighborhoods. Investor-heavy ZIPs tend to show the lowest ratios due to discounted cash purchases.

### Factor 4: Months of Supply (`months_of_supply`)

**Derived metric:** Redfin no longer publishes `MONTHS_OF_SUPPLY` at ZIP level — the column is null in all rows of the source file.  
**Formula:** `months_of_supply = INVENTORY / (HOMES_SOLD / 3)` where HOMES_SOLD is over a 90-day period, so dividing by 3 gives monthly sales rate  
**Unit:** months  
**ZIPs with null:** None — all 51 have computed values (though derived, not Redfin-published)  
**Caveat:** This approximation will be noisier for low-volume ZIPs. Values above 6 months indicate a buyer's market; below 3 months indicates seller's market.

### Factor 5: Share Sold Above List (`pct_sold_above_list`)

**Column:** `SOLD_ABOVE_LIST` (stored as fraction in Redfin; converted to percent)  
**Unit:** percent  
**Formula:** `pct_sold_above_list = SOLD_ABOVE_LIST × 100`  
**ZIPs with null:** None — all 51 have real data  
**Score direction:** Higher share → more bidding-war activity → higher risk

---

## Factor 6: Price-to-Income Ratio

**Status: REAL DATA (workaround sources) — available for all 51 ZIPs**

**Home value (numerator — workaround):**  
Redfin `MEDIAN_SALE_PRICE` for "All Residential", trailing 90-day period ending 2026-03-31.  
Source: same Redfin file as Factors 2–5 (see above).  
Note: Zillow ZHVI (`files.zillowstatic.com`) was inaccessible (host blocked). Redfin median sale price is used as a proxy. The two series track closely at ZIP level but Redfin sale price reflects closed transactions while ZHVI is a model-smoothed estimate; values will differ slightly.

**Median household income (denominator — workaround):**  
ACS 5-year 2012–2016 (2016 inflation-adjusted dollars), sourced from the public GitHub repository `Ro-Data/Ro-Census-Summaries-By-Zipcode`.  
URL: https://raw.githubusercontent.com/Ro-Data/Ro-Census-Summaries-By-Zipcode/master/econ.txt  
Column: `income_and_benefits_in_2016_inflation_adjusted_dollars-dollars-median_household_income_dollars`  
Downloaded: 2026-05-01  
Note: Census ACS API (`api.census.gov`) was blocked. The 2016-vintage income data is ~6–8 years older than the 2022 ACS vintage originally specified. This inflates computed ratios in all ZIPs — use values for **relative comparisons between ZIPs only**, not as absolute affordability measures.

**Formula:** `price_to_income = round(redfin_median_sale_price / acs_median_income_2016, 2)`

**Caveats:**
- Several ZIPs show extreme PTI values due to old income data: 44114 (Downtown, PTI=21.6), 44115 (Midtown, PTI=15.2), 44106 (University Circle, PTI=10.1). These ZIPs have unusually low 2016 incomes reflecting small residential populations in mixed commercial areas. The 2022 ACS income would yield more moderate ratios (~4–7×).
- Despite the vintage mismatch, the ordinal ranking (suburban ZIPs vs. investor-heavy inner-city vs. affluent eastern suburbs) is directionally correct.
- The `acs_median_income_2016` field is stored in the JSON alongside `price_to_income` for transparency.

**ZIPs with null price_to_income:** None — all 51 have computed values.

---

## Factor 7: FHA Loan Share

**Status: INACCESSIBLE — null for all 51 ZIPs**

**Source:** FFIEC HMDA 2023 Snapshot National Loan Level Dataset  
URL: https://ffiec.cfpb.gov/data-publication/snapshot-national-loan-level-dataset/2023  
Reasons:
- `ffiec.cfpb.gov` blocked by proxy allowlist
- `cfpb-hmda-public.s3.amazonaws.com` is network-reachable but returns HTTP 403 Access Denied for all tested file paths (both the full snapshot ZIP and Ohio-filtered files)
- HUD USPS TRACT_ZIP crosswalk also inaccessible (`www.huduser.gov` blocked)

**Intended methodology:**
- Filter LAR for `action_taken == 1` (originated), `loan_purpose == 1` (home purchase), `loan_type == 2` (FHA-insured), `county_code == 039` (Cuyahoga)
- Restrict to `derived_dwelling_category` for 1–4 family properties
- Convert census tract to ZIP via HUD USPS TRACT_ZIP crosswalk (proportional allocation)
- `fha_share = (FHA originations in ZIP / all home purchase originations in ZIP) × 100`

**ZIPs with null fha_share:** All 51.

---

## Composite Score Formula

```
risk = Σ (factor_value_normalized × weight) / Σ (weights of available factors)
```

Each factor is normalized to [0, 1] before weighting. If a factor is unavailable for a ZIP, its weight is redistributed proportionally to available factors.

Normalization ranges (calibrated to Cuyahoga County distribution):

| Factor | Weight | 0 (low risk) | 1 (high risk) |
|--------|--------|-------------|---------------|
| corporate_pct | 35% | ≤5% | ≥40% |
| median_dom | 20% | ≥60 days | ≤5 days |
| sale_to_list | 20% | ≤0.95 | ≥1.05 |
| pct_sold_above_list | 10% | 0% | ≥60% |
| price_to_income | 10% | ≤2 | ≥8 |
| fha_share | 10% (inverted) | ≤10% | ≥50% |

With corporate_pct and fha_share null (combined 35% weight), the current data supports a partial risk score using Factors 2–6 (65% combined weight). ZIPs with `coverage < 0.50` (weight of available factors < 50%) will be flagged as insufficient-data — all 51 ZIPs clear this threshold (65% ≥ 50%) when the PTI workaround is included.

---

## Data Files

| File | Description |
|------|-------------|
| `data/cuyahoga_zip_metrics.json` | Final per-ZIP metrics with vintage metadata (real Redfin data; other factors null) |
| `data/cuyahoga_zip_boundaries.json` | GeoJSON FeatureCollection, 51 Cuyahoga ZCTAs |
| `data/raw/redfin_cuyahoga.tsv` | Redfin market tracker rows filtered to Cuyahoga ZIPs (32,065 rows, all property types, multi-year history through 2026-03-31) |
| `data/raw/redfin_header.txt` | Column header from Redfin TSV file |
| `data/raw/redfin_metrics.json` | Processed per-ZIP Redfin metrics (intermediate file) |
| `data/raw/cuyahoga_zips_scpike.csv` | ZIP universe source data from scpike/us-state-county-zip |
| `data/raw/tab20_zcta520_county20_natl.txt` | Census ZCTA-county file (inaccessible — file contains proxy error message) |

---

## Known Limitations and Next Steps

1. **Factor 1 (corporate ownership)** is the most impactful missing factor (35% weight). Requires access to `gis.cuyahogacounty.us` ArcGIS parcel service or the Cuyahoga County Auditor's parcel data download.

2. **Factor 6 (price-to-income)** is computed via workaround (Redfin median sale price + ACS 2016 income). For a production refresh: unblock `api.census.gov` (ACS 2022 B19013) and `files.zillowstatic.com` (ZHVI) to replace both proxy sources with the intended originals. The 2016 income data inflates ratios; the direction is correct but absolute values should not be cited.

3. **Factor 7 (FHA share)** requires unblocking `ffiec.cfpb.gov` or obtaining an S3 presigned URL for the HMDA Ohio-filtered file.

4. **Months of supply** is derived rather than direct; validation against NAR or Redfin metro-level figures recommended.

5. **ZIP universe** should be validated against 2020 Census ZCTA-county relationship file once `www2.census.gov` is accessible.
