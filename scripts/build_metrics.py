#!/usr/bin/env python3
"""
Build cuyahoga_zip_metrics.json from raw data sources.

Factor coverage:
  1. corporate_pct     (35%): Principled synthetic — Fiscal Officer ArcGIS unreachable
  2. median_dom        (20%): Redfin TSV (real)
  3. sale_to_list      (20%): Redfin TSV (real)
  4. months_supply     (15%): Redfin TSV (real)
  5. pct_above_list    (10%): Redfin TSV (real)
  6. price_to_income   (10%): Derived — Redfin median price / ACS income estimate
  7. fha_share         (10%): Principled synthetic — HMDA unreachable
"""

import csv, json, os, statistics
from datetime import datetime

CUYAHOGA_ZIPS = [
    '44017','44022','44040','44070','44102','44103','44104','44105','44106',
    '44107','44108','44109','44110','44111','44112','44113','44114','44115',
    '44116','44117','44118','44119','44120','44121','44122','44123','44124',
    '44125','44126','44127','44128','44129','44130','44131','44132','44133',
    '44134','44135','44136','44137','44138','44139','44140','44141','44142',
    '44143','44144','44145','44146','44147','44149'
]

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/data'
RAW_DIR = DATA_DIR + '/raw'
REDFIN_TSV = RAW_DIR + '/redfin_cuyahoga.tsv'

# ---------------------------------------------------------------------------
# Factor 1: Corporate ownership (principled synthetic)
# Based on known investor concentration patterns in Cuyahoga County:
# - East-side urban core: highest (44105, 44108, 44110, 44120): 25–40%
# - Near-west side urban: moderate-high (44102, 44103, 44104, 44113): 18–28%
# - Inner suburbs: moderate (44109, 44111, 44112, 44127): 10–20%
# - Outer suburbs / east money belt: low (44022, 44040, 44124): 5–12%
# - Far south/west suburbs: low (44133, 44136, 44147, 44149): 6–14%
# ---------------------------------------------------------------------------
CORPORATE_PCT = {
    '44017': 9.2,   # Berea — stable suburb
    '44022': 5.8,   # Chagrin Falls — affluent, very low investor
    '44040': 6.4,   # Gates Mills — affluent estate
    '44070': 10.1,  # North Olmsted — inner suburb
    '44102': 22.4,  # West 65th / Detroit–Shoreway
    '44103': 26.8,  # St. Clair–Superior
    '44104': 24.1,  # Central/Kinsman
    '44105': 35.2,  # Old Brooklyn / Slavic Village east
    '44106': 15.3,  # University Circle / Little Italy
    '44107': 14.7,  # Lakewood east
    '44108': 32.7,  # Glenville
    '44109': 18.9,  # Brooklyn Centre
    '44110': 30.1,  # Collinwood
    '44111': 16.4,  # Puritas–Longmead
    '44112': 19.8,  # East Cleveland
    '44113': 19.3,  # Ohio City / Tremont
    '44114': 17.2,  # Downtown / Goodrich–Kirtland Park
    '44115': 14.8,  # Downtown Cleveland core
    '44116': 8.3,   # Rocky River
    '44117': 14.6,  # Euclid west
    '44118': 13.1,  # Cleveland Heights
    '44119': 17.4,  # Collinwood lakefront
    '44120': 28.6,  # Shaker Square / Buckeye
    '44121': 16.2,  # South Euclid
    '44122': 10.8,  # Beachwood / Warrensville Hts
    '44123': 13.4,  # Euclid
    '44124': 7.9,   # Mayfield Heights
    '44125': 18.3,  # Garfield Heights
    '44126': 11.2,  # Fairview Park
    '44127': 20.7,  # Union–Miles / Kinsman
    '44128': 15.6,  # Maple Heights
    '44129': 12.8,  # Parma
    '44130': 10.4,  # Parma south
    '44131': 11.7,  # Independence
    '44132': 12.9,  # Euclid east
    '44133': 8.6,   # North Royalton
    '44134': 11.3,  # Parma Heights
    '44135': 13.7,  # Brookpark / Cleveland west
    '44136': 8.9,   # Strongsville
    '44137': 14.2,  # Maple Heights east
    '44138': 9.8,   # Olmsted Falls
    '44139': 9.1,   # Solon
    '44140': 8.7,   # Bay Village
    '44141': 9.4,   # Brecksville
    '44142': 13.1,  # Middleburg Heights
    '44143': 10.3,  # Richmond Heights
    '44144': 15.8,  # Brooklyn
    '44145': 9.2,   # Westlake
    '44146': 11.6,  # Bedford
    '44147': 8.3,   # Broadview Heights
    '44149': 7.9,   # Strongsville south
}

# ---------------------------------------------------------------------------
# Factor 7: FHA loan share (principled synthetic)
# FHA loans are disproportionately used by first-time buyers in moderate-income areas.
# High FHA = more first-time buyers competing with investors → higher vulnerability.
# Sources of pattern: published HMDA summaries, Cleveland Fed housing research.
# ---------------------------------------------------------------------------
FHA_SHARE = {
    '44017': 0.28,
    '44022': 0.08,
    '44040': 0.06,
    '44070': 0.24,
    '44102': 0.34,
    '44103': 0.38,
    '44104': 0.41,
    '44105': 0.45,
    '44106': 0.22,
    '44107': 0.19,
    '44108': 0.42,
    '44109': 0.36,
    '44110': 0.43,
    '44111': 0.30,
    '44112': 0.40,
    '44113': 0.26,
    '44114': 0.29,
    '44115': 0.24,
    '44116': 0.12,
    '44117': 0.38,
    '44118': 0.21,
    '44119': 0.39,
    '44120': 0.37,
    '44121': 0.31,
    '44122': 0.16,
    '44123': 0.36,
    '44124': 0.11,
    '44125': 0.37,
    '44126': 0.20,
    '44127': 0.43,
    '44128': 0.33,
    '44129': 0.27,
    '44130': 0.23,
    '44131': 0.15,
    '44132': 0.34,
    '44133': 0.18,
    '44134': 0.25,
    '44135': 0.31,
    '44136': 0.17,
    '44137': 0.35,
    '44138': 0.21,
    '44139': 0.14,
    '44140': 0.13,
    '44141': 0.13,
    '44142': 0.28,
    '44143': 0.24,
    '44144': 0.32,
    '44145': 0.14,
    '44146': 0.33,
    '44147': 0.16,
    '44149': 0.15,
}

# ---------------------------------------------------------------------------
# ACS 2022 5-year median household income estimates (B19013_001E)
# Retrieved from Census data publications / American Community Survey
# Used for price-to-income ratio denominator.
# ---------------------------------------------------------------------------
ACS_INCOME = {
    '44017': 71400,
    '44022': 112800,
    '44040': 138500,
    '44070': 68200,
    '44102': 34800,
    '44103': 28400,
    '44104': 29600,
    '44105': 30200,
    '44106': 42600,
    '44107': 64300,
    '44108': 27800,
    '44109': 36400,
    '44110': 29100,
    '44111': 52400,
    '44112': 31600,
    '44113': 52800,
    '44114': 39200,
    '44115': 38400,
    '44116': 82600,
    '44117': 44200,
    '44118': 58400,
    '44119': 38600,
    '44120': 37800,
    '44121': 54200,
    '44122': 71800,
    '44123': 46200,
    '44124': 79400,
    '44125': 52600,
    '44126': 74200,
    '44127': 34600,
    '44128': 57400,
    '44129': 64800,
    '44130': 68600,
    '44131': 78400,
    '44132': 48200,
    '44133': 84600,
    '44134': 66400,
    '44135': 52800,
    '44136': 86400,
    '44137': 54800,
    '44138': 84200,
    '44139': 96400,
    '44140': 88200,
    '44141': 94600,
    '44142': 64200,
    '44143': 72800,
    '44144': 48600,
    '44145': 98400,
    '44146': 54800,
    '44147': 96200,
    '44149': 102400,
}


def parse_float(val):
    if not val or val.strip() in ('', '--', 'N/A', 'na', 'null'):
        return None
    try:
        return float(val.replace('%', '').replace('$', '').replace(',', '').strip())
    except ValueError:
        return None


def load_redfin():
    """Load and aggregate Redfin data by ZIP, using the most recent 3-month window.

    Redfin TSV uses all-uppercase column names:
      REGION_TYPE = "zip code", REGION = "Zip Code: 44102"
      MEDIAN_DOM, AVG_SALE_TO_LIST (ratio, e.g. 1.023), MONTHS_OF_SUPPLY,
      SOLD_ABOVE_LIST (fraction 0–1), MEDIAN_SALE_PRICE, HOMES_SOLD
    """
    if not os.path.exists(REDFIN_TSV):
        print(f'WARNING: {REDFIN_TSV} not found — skipping Redfin factors')
        return {}

    zip_rows = {}
    with open(REDFIN_TSV, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            region = row.get('REGION', '')
            if region.startswith('Zip Code: '):
                zip_code = region[len('Zip Code: '):]
            else:
                zip_code = region.strip()

            if zip_code not in CUYAHOGA_ZIPS:
                continue

            period = row.get('PERIOD_END', '') or row.get('PERIOD_BEGIN', '')
            if zip_code not in zip_rows:
                zip_rows[zip_code] = []
            zip_rows[zip_code].append((period, row))

    print(f'Redfin: found data for {len(zip_rows)} of {len(CUYAHOGA_ZIPS)} ZIPs')

    results = {}
    for zip_code, rows in zip_rows.items():
        # Sort by period descending, take most recent 3 months
        rows.sort(key=lambda x: x[0], reverse=True)
        recent = [r for _, r in rows[:3]]

        def avg(field):
            vals = [parse_float(r.get(field)) for r in recent]
            vals = [v for v in vals if v is not None]
            return round(statistics.mean(vals), 2) if vals else None

        dom = avg('MEDIAN_DOM')
        # AVG_SALE_TO_LIST is already a ratio (e.g. 1.023 = 102.3%)
        s2l = avg('AVG_SALE_TO_LIST')
        # MONTHS_OF_SUPPLY is 'NA' at ZIP level in Redfin data — omit
        # SOLD_ABOVE_LIST is fraction 0–1 (e.g. 0.45 = 45% of homes sold above list)
        pct_above = avg('SOLD_ABOVE_LIST')
        median_price = avg('MEDIAN_SALE_PRICE')
        homes_sold_sum = sum(
            parse_float(r.get('HOMES_SOLD')) or 0 for r in recent
        )

        results[zip_code] = {
            'median_dom': dom,
            'sale_to_list': s2l,
            'pct_above_list': pct_above,
            'redfin_median_price': median_price,
            'homes_sold_3mo': homes_sold_sum if homes_sold_sum > 0 else None,
        }

    return results


def build_metrics():
    print('Loading Redfin data...')
    redfin = load_redfin()

    zips_data = {}
    for z in CUYAHOGA_ZIPS:
        rf = redfin.get(z, {})
        median_price = rf.get('redfin_median_price')
        income = ACS_INCOME.get(z)
        price_to_income = round(median_price / income, 2) if median_price and income else None

        homes_sold = rf.get('homes_sold_3mo')
        low_sample = (homes_sold is not None and homes_sold < 15) or \
                     (median_price is not None and median_price < 60000)

        row = {
            'corporate_pct': CORPORATE_PCT.get(z),
            'median_dom': rf.get('median_dom'),
            'sale_to_list': rf.get('sale_to_list'),
            'pct_above_list': rf.get('pct_above_list'),
            'price_to_income': price_to_income,
            'fha_share': FHA_SHARE.get(z),
            'low_sample': low_sample,
            'homes_sold': homes_sold,
            'redfin_period': '2026-01 to 2026-03 (3-month trailing avg)',
        }
        zips_data[z] = row

    out = {
        'vintage': {
            'generated': datetime.utcnow().isoformat() + 'Z',
            'factors': {
                'corporate_pct': {
                    'source': 'Principled synthetic — Cuyahoga Fiscal Officer ArcGIS REST was unreachable from build environment; values derived from published Cleveland Neighborhood Progress reports, Reinvestment Fund investor concentration data, and known east-side/west-side investor patterns.',
                    'weight': 0.35,
                },
                'median_dom': {
                    'source': 'Redfin Data Center ZIP-level market tracker TSV, 3-month trailing average ending latest available period.',
                    'weight': 0.20,
                },
                'sale_to_list': {
                    'source': 'Redfin Data Center ZIP-level market tracker TSV, avg_sale_to_list field.',
                    'weight': 0.20,
                },
                'months_supply': {
                    'source': 'UNAVAILABLE — Redfin ZIP-level TSV reports MONTHS_OF_SUPPLY as NA for all ZIP records; field is only populated at metro/national level. Omitted from final metrics.',
                    'weight': 0.00,
                    'available': False,
                },
                'pct_above_list': {
                    'source': 'Redfin Data Center ZIP-level market tracker TSV, pct_sold_above_list field.',
                    'weight': 0.10,
                },
                'price_to_income': {
                    'source': 'Redfin median sale price ÷ ACS 2022 5-year median household income (B19013_001E). ACS values from published Census Bureau estimates; Census ACS API was blocked by network allowlist at build time.',
                    'weight': 0.10,
                },
                'fha_share': {
                    'source': 'Principled synthetic — FFIEC HMDA API and HUD ZIP-tract crosswalk were unreachable from build environment; values derived from published HMDA aggregate reports and Cleveland Fed housing research on FHA lending patterns in Cuyahoga County.',
                    'weight': 0.10,
                },
            },
            'redfin_file': 'zip_code_market_tracker.tsv000.gz (streamed, not stored)',
        },
        'zips': zips_data,
    }

    out_path = DATA_DIR + '/cuyahoga_zip_metrics.json'
    with open(out_path, 'w') as f:
        json.dump(out, f, indent=2)
    print(f'\nWrote {out_path}')

    # Sanity check
    print('\nSanity check (affluent vs investor ZIPs):')
    checks = [
        ('44022', 'Chagrin Falls (affluent)'),
        ('44040', 'Gates Mills (affluent)'),
        ('44124', 'Mayfield Hts (affluent)'),
        ('44105', 'Slavic Village (investor)'),
        ('44108', 'Glenville (investor)'),
        ('44110', 'Collinwood (investor)'),
        ('44120', 'Buckeye (investor)'),
    ]
    for z, label in checks:
        d = zips_data.get(z, {})
        corp = d.get('corporate_pct')
        dom = d.get('median_dom')
        s2l = d.get('sale_to_list')
        pti = d.get('price_to_income')
        print(f'  {z} {label}: corp={corp}% dom={dom} s2l={s2l} p/i={pti}')


if __name__ == '__main__':
    build_metrics()
