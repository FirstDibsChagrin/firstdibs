# LLC / Corporate Ownership Sourcing Attempts
**Date:** 2026-05-01  
**Task:** Compute % of residential parcels owned by LLC/corporate entities, by Cuyahoga County ZIP  
**Result:** All paths blocked — `corporate_pct` remains null for all 51 ZIPs

---

## Network Environment Constraint

This session operates behind a network proxy that blocks all hosts not on an explicit allowlist.
Accessible hosts: `raw.githubusercontent.com`, `redfin-public-data.s3.us-west-2.amazonaws.com`, and `github.com` (HTML only, no downloads).  
All other hosts return `HTTP 403 / x-deny-reason: host_not_allowed`.

---

## Path A — Cuyahoga County ArcGIS REST FeatureServer

### A1. ArcGIS Hub portals
| URL | Status | Note |
|-----|--------|------|
| `https://cuyahoga-county.opendata.arcgis.com/` | 403 host_not_allowed | ArcGIS Hub subdomain blocked |
| `https://data.cuyahogacounty.us/` | (empty — DNS not resolving through proxy) | Alternative county data portal unreachable |
| `https://hub.arcgis.com/search?collection=Dataset&q=cuyahoga%20parcels` | 403 host_not_allowed | ArcGIS Hub search blocked |
| `https://data-cuyahoga.opendata.arcgis.com/` | 403 host_not_allowed | County-branded ArcGIS Hub blocked |
| `https://data-cuyahoga.opendata.arcgis.com/api/feed/dcat-us/1.1.json` | 403 host_not_allowed | DCAT catalog endpoint blocked |

### A2. Self-hosted Cuyahoga GIS REST services
| URL | Status | Note |
|-----|--------|------|
| `https://gis.cuyahogacounty.us/arcgis/rest/services/?f=json` | 403 host_not_allowed | County GIS server blocked |
| `https://fiscalhub.gis.cuyahogacounty.gov/arcgis/rest/services/?f=json` | 403 host_not_allowed | Fiscal GIS hub blocked |
| `https://geospatial.gis.cuyahogacounty.gov/arcgis/rest/services/?f=json` | 403 host_not_allowed | Geospatial hub blocked |

### A3. ArcGIS Online hosted services (services.arcgis.com subdomains)
| URL | Status | Note |
|-----|--------|------|
| `https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/?f=json` | 403 host_not_allowed | ESRI-hosted org services blocked |
| `https://services1.arcgis.com/…` through `services9.arcgis.com/…` | 403 host_not_allowed | All services subdomains blocked |
| `https://opendata.arcgis.com/datasets/8bff3524ed374480b8c6ebb1b237b6b3_0.csv` | 403 host_not_allowed | Parcels with Real Property CAMA — blocked |
| `https://www.arcgis.com/sharing/rest/…` | 403 host_not_allowed | ArcGIS sharing API blocked |
| `https://cuyahogacounty.maps.arcgis.com/sharing/rest/…` | 403 host_not_allowed | Org-specific ArcGIS sharing API blocked |
| `https://hub.arcgis.com/api/v3/datasets/a84be47945564300a2119f6b9a411d59_0` | 403 host_not_allowed | Hub v3 API blocked |
| `https://ago-item-storage.s3.us-east-1.amazonaws.com/` | 403 host_not_allowed | ArcGIS S3 CDN storage blocked |

**Note on item IDs found:**  
- `a84be47945564300a2119f6b9a411d59` — "Combined Parcels - Cleveland Only" (City of Cleveland GitHub notebook `City-of-Cleveland/open-data-examples/blob/main/02-County Property Data - Corporate Owners by Neighborhood.ipynb` confirms this item ID and the field `deeded_owner` for owner-name matching). This dataset is Cleveland-city-only, not full county.  
- `8bff3524ed374480b8c6ebb1b237b6b3` — "Parcels with Real Property CAMA" (full county). Both blocked.

**Path A conclusion:** Every ArcGIS-related hostname is blocked. The data exists and is publicly available via the county's ArcGIS Hub; the block is network-environment-specific.

---

## Path B — Cuyahoga County Fiscal Officer Bulk Download / NEOCANDO

| URL | Status | Note |
|-----|--------|------|
| `https://fiscalofficer.cuyahogacounty.us/` | 403 host_not_allowed | Fiscal Officer website blocked |
| `https://fiscalofficer.cuyahogacounty.us/sitemap.xml` | 403 host_not_allowed | Same |
| `https://neocando.case.edu/` | 403 host_not_allowed | Case Western NEO CANDO blocked |
| `https://neocando.case.edu/cando/propertyDatHome.do` | 403 host_not_allowed | NEO CANDO property data page blocked |

**Path B conclusion:** Both the Fiscal Officer download portal and NEO CANDO are blocked.

---

## Path C — City of Cleveland Rental Registry / Open Data Portal

| URL | Status | Note |
|-----|--------|------|
| `https://data.clevelandohio.gov/` | 403 host_not_allowed | City of Cleveland Socrata portal blocked |
| `https://data.clevelandohio.gov/api/catalog/v1?q=parcel` | 403 host_not_allowed | Socrata catalog API blocked |
| `https://opendata.clevelandohio.gov/` | DNS does not resolve through proxy | Alternative subdomain unreachable |
| `https://www.clevelandohio.gov/…/RentalRegistration` | 403 host_not_allowed | City of Cleveland website blocked |

**Path C conclusion:** All Cleveland open data endpoints are blocked.

---

## Path D — Published Reports (Last Resort)

### D1. Western Reserve Land Conservancy
| URL | Status | Note |
|-----|--------|------|
| `https://www.wrlandconservancy.org/` | 403 host_not_allowed | WRLC website blocked |

### D2. Federal Reserve Bank of Cleveland
| URL | Status | Note |
|-----|--------|------|
| `https://www.clevelandfed.org/community-development` | 403 host_not_allowed | Cleveland Fed website blocked |
| `https://www.clevelandfed.org/publications/cd-reports/2025/20250904-investor-owned-home-trends-…` | 403 host_not_allowed | "Hotspots" report landing page blocked |
| `https://www.clevelandfed.org/-/media/…/20250904-investor-owned-home-trends.pdf` | 403 host_not_allowed | Full PDF blocked |

**Data found via web search snippets (not ZIP-level; county/tract aggregates only):**
- Cuyahoga "hotspot" census tracts in 2024: ~27% of SFHs investor-owned on average
- Investor purchases in hotspot tracts in 2024: ~43% of SFH transactions
- County-wide investor ownership rose from 7% (2004) → 21% (2020)
- "Poorer pockets" of Cuyahoga: up to ~33% LLC/trust-owned SFHs
- East Side Cleveland historically Black neighborhoods (2021 survey): 46%+ of sales to businesses
- Definition used: LLCs/corps by name OR individuals/trusts averaging ≥2 transactions/year

These figures are at county and census-tract aggregate level; ZIP-level breakdown requires the full PDF (blocked) or the underlying tract-level data (blocked).

### D3. Other reports
| URL | Status | Note |
|-----|--------|------|
| `https://case.edu/socialwork/nimc` | 403 host_not_allowed | Urban Poverty Center blocked |
| `https://clevelandnp.org/` | 403 host_not_allowed | Cleveland Neighborhood Progress blocked |
| `https://stateline.org/…` | 403 host_not_allowed | Stateline article blocked |
| `https://signalohio.org/…` | 403 host_not_allowed | Signal Ohio article blocked |
| `https://www.lisc.org/…` | 403 host_not_allowed | LISC report blocked |
| `https://www.gao.gov/assets/gao-24-106643.pdf` | 403 host_not_allowed | GAO rental housing report blocked |
| All regional NPR/public radio outlets (wosu, wvxu, wyso, woub, ideastream, statenews) | 403 host_not_allowed | All blocked |

### D4. GitHub search for pre-computed results
| URL / Query | Status | Note |
|-------------|--------|------|
| `raw.githubusercontent.com/City-of-Cleveland/cle-data-toolkit/…` | 404 | Repo does not exist at that path |
| `raw.githubusercontent.com/COD-Team/cuyahoga-parcel-data/…` | 404 | Repo does not exist |
| `raw.githubusercontent.com/cityofcleveland/property-data/…` | 404 | Repo does not exist |
| PyPI `cledatatoolkit` | Not found | Package not on PyPI |
| Web search for committed parcel CSVs on GitHub | No results | No GitHub repo found with Cuyahoga parcel data committed as a file |

### D5. Ohio state geospatial portals
| URL | Status | Note |
|-----|--------|------|
| `https://geodata.ohio.gov/…` | 403 host_not_allowed | Ohio GIS portal blocked |
| `https://gis5.oit.ohio.gov/arcgis/rest/services/OGRIP/Parcels/MapServer` | 403 host_not_allowed | Ohio OGRIP parcel service blocked |
| `https://ogrip.oit.ohio.gov/Home/GISData` | 403 host_not_allowed | Ohio GIS data portal blocked |
| `https://gis.ohiodnr.gov/arcgis/rest/services/` | 403 host_not_allowed | Ohio DNR GIS blocked |

---

## Summary

**All four paths failed.** The data is publicly available through normal browser access to the Cuyahoga County ArcGIS Hub (`data-cuyahoga.opendata.arcgis.com`) but every domain involved in serving it — ArcGIS.com and its subdomains, the county's own GIS servers, the Fiscal Officer website, city data portals, and published report hosts — is blocked by the network proxy allowlist.

**To unblock this factor in a future refresh, access from a network without these restrictions is needed.** The City of Cleveland's public GitHub notebook (`City-of-Cleveland/open-data-examples`, notebook 02) provides the exact methodology and ArcGIS item IDs needed to compute corporate ownership from parcel data; it can be run in a normal browser/network environment in under 10 minutes.

**`corporate_pct` remains null for all 51 Cuyahoga ZIPs.**
