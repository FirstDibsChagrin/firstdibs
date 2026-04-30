# Cuyahoga County ZIP Risk Factor Methodology

**Version:** 7-factor v1  
**Branch:** `data/cuyahoga-7factor-v1`  
**Generated:** 2026-04-30  
**Coverage:** 51 Cuyahoga County ZCTAs

---

## Factors Not Found (Completely Unobtainable)

The following factors could not be populated because the required data sources were blocked by the network proxy. Only `github.com`, `raw.githubusercontent.com`, and the Redfin public S3 bucket (`redfin-public-data.s3.us-west-2.amazonaws.com`) were accessible. All government API endpoints returned HTTP 403 ("Host not in allowlist").

| Factor | Source | Reason Null |
|--------|--------|-------------|
| **Factor 1: Corporate/LLC ownership %** | Cuyahoga County Fiscal Officer ArcGIS (`gis.cuyahogacounty.us`) | Host blocked by proxy allowlist |
| **Factor 6: Price-to-income ratio** | Zillow ZHVI (`files.zillowstatic.com`) + Census ACS B19013 (`api.census.gov`) | Both hosts blocked by proxy allowlist |
| **Factor 7: FHA loan share** | FFIEC HMDA 2023 snapshot (`ffiec.cfpb.gov`); CFPB S3 (`cfpb-hmda-public.s3.amazonaws.com`) returns Access Denied | Host blocked; S3 bucket returns 403 |

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

**Source:** Cuyahoga County Fiscal Officer ArcGIS REST parcel service  
**URL:** https://gis.cuyahogacounty.us/arcgis/rest/services/  
**Status: INACCESSIBLE — null for all 51 ZIPs**

**Intended methodology:**
- Query parcel layer for PARCEL, OWNER_NAME, SITE_ZIP, LAND_USE
- Flag as corporate if OWNER_NAME matches regex (case-insensitive):  
  `\b(LLC|L\.L\.C\.|LIMITED LIABILITY|INC\b|INCORPORATED|CORP\b|CORPORATION|HOLDINGS|REALTY|PROPERTIES|VENTURES|INVESTMENTS|CAPITAL|EQUITY|FUND|PARTNERS|LP|L\.P\.|LLP|REIT)\b`
- Exclude: FAMILY TRUST, LIVING TRUST, REVOCABLE TRUST, or TRUSTEE followed by personal name pattern
- `corporate_pct = (corporate parcels in ZIP / total residential parcels in ZIP) × 100`

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

**Status: INACCESSIBLE — null for all 51 ZIPs**

**ZHVI (numerator):**  
Zillow Research ZHVI (smoothed, seasonally adjusted, mid-tier, all homes) by ZIP  
URL: https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv  
Reason: `files.zillowstatic.com` blocked by proxy allowlist.

**ACS Income (denominator):**  
Census ACS 5-year 2022, Table B19013_001E (Median Household Income)  
URL: https://api.census.gov/data/2022/acs/acs5?get=B19013_001E,NAME&for=zip%20code%20tabulation%20area:*  
Reason: `api.census.gov` blocked by proxy allowlist.

**Intended formula:** `price_to_income = ZHVI / acs_median_household_income` (rounded to 2 decimal places)

**Note:** Redfin `MEDIAN_SALE_PRICE` (March 2026 period) is available for all 51 ZIPs and is included in the output as `redfin_median_sale_price` for reference. It is NOT used to compute `price_to_income` because ACS income data is unavailable — mixing sources would produce a misleading ratio.

**ZIPs with null price_to_income:** All 51.

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

With corporate_pct, price_to_income, and fha_share all null (combined 55% weight), the current data supports only a partial risk score using Factors 2–5 (45% combined weight).

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

2. **Factor 6 (price-to-income)** requires unblocking `api.census.gov` (ACS income) and `files.zillowstatic.com` (ZHVI). Alternatively, median sale price from Redfin could be used with ACS income if ACS becomes accessible.

3. **Factor 7 (FHA share)** requires unblocking `ffiec.cfpb.gov` or obtaining an S3 presigned URL for the HMDA Ohio-filtered file.

4. **Months of supply** is derived rather than direct; validation against NAR or Redfin metro-level figures recommended.

5. **ZIP universe** should be validated against 2020 Census ZCTA-county relationship file once `www2.census.gov` is accessible.
