import os
import sys
import time
import json
import requests
from datetime import datetime, timedelta
from feature_flags import (
    NATIONAL_MODE, FETCH_LISTINGS, FETCH_MARKET_STATS,
    FETCH_OWNERSHIP_DATA, FETCH_CENSUS_BOUNDARIES,
    ON_DEMAND_ONLY, CACHE_HOURS, ENABLED_ZIPS
)

# ============================================================
# SAFETY CHECK — runs first, before anything else
# If all features are off, script exits immediately (no API calls)
# ============================================================
def safety_check():
    any_enabled = any([
        FETCH_LISTINGS,
        FETCH_MARKET_STATS,
        FETCH_OWNERSHIP_DATA,
        FETCH_CENSUS_BOUNDARIES
    ])
    if not any_enabled:
        print("=" * 50)
        print("All features are OFF in feature_flags.py")
        print("No API calls made. No charges incurred.")
        print("To enable features, edit scripts/feature_flags.py")
        print("=" * 50)
        sys.exit(0)

    if len(ENABLED_ZIPS) == 0 and not NATIONAL_MODE:
        print("=" * 50)
        print("No ZIPs enabled in ENABLED_ZIPS and NATIONAL_MODE=False")
        print("Nothing to fetch. Exiting.")
        print("=" * 50)
        sys.exit(0)

    print("Features enabled:")
    print(f"  FETCH_LISTINGS:         {FETCH_LISTINGS}")
    print(f"  FETCH_MARKET_STATS:     {FETCH_MARKET_STATS}")
    print(f"  FETCH_OWNERSHIP_DATA:   {FETCH_OWNERSHIP_DATA}")
    print(f"  FETCH_CENSUS_BOUNDARIES:{FETCH_CENSUS_BOUNDARIES}")
    print(f"  NATIONAL_MODE:          {NATIONAL_MODE}")
    print(f"  ON_DEMAND_ONLY:         {ON_DEMAND_ONLY}")
    print(f"  ZIPs to process:        {len(ENABLED_ZIPS)}")
    print()

# ============================================================
# API CREDENTIALS
# ============================================================
RENTCAST_KEY = os.environ.get("RENTCAST_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

CORPORATE_KEYWORDS = [
    'LLC', 'L.L.C', 'Holdings', 'Residential', 'Partners', 'Capital',
    'Trust', 'Investments', 'Realty', 'Properties', 'Group', 'Homes',
    'Assets', 'Ventures', 'Acquisitions', 'Management', 'Real Estate',
    'Rental', 'Rentals', 'Fund', 'Equity', 'Investment', 'REIT',
    'Blackstone', 'Invitation', 'Progress', 'SFR', 'Cerberus',
    'Tricon', 'Pretium', 'American Homes', 'Amherst', 'Roofstock'
]

def is_corporate(owner_name, owner_type=None):
    if owner_type and str(owner_type).lower() == 'organization':
        return True
    if not owner_name:
        return False
    name_upper = str(owner_name).upper()
    return any(k.upper() in name_upper for k in CORPORATE_KEYWORDS)

# ============================================================
# SUPABASE HELPERS
# ============================================================
def supabase_get(table, params=''):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    r = requests.get(url, headers=headers, timeout=15)
    return r.json() if r.ok else []

def supabase_upsert(table, data, on_conflict=None):
    if not data:
        return True

    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if on_conflict:
        url += f"?on_conflict={on_conflict}"

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
    }

    batch_size = 100
    all_ok = True

    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        r = requests.post(url, headers=headers, json=batch, timeout=20)
        if not r.ok:
            all_ok = False
            print(f"  Supabase error: {r.status_code} — {r.text[:300]}")

    return all_ok

def supabase_delete(table, condition):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{condition}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "return=minimal"
    }
    r = requests.delete(url, headers=headers, timeout=15)
    return r.ok

def is_cache_fresh(zip_code, data_type):
    rows = supabase_get(
        'cache_status',
        f"zip=eq.{zip_code}&data_type=eq.{data_type}&select=updated_at"
    )
    if not rows:
        return False

    try:
        updated = datetime.fromisoformat(rows[0]['updated_at'].replace('Z', '+00:00'))
        age = datetime.now(updated.tzinfo) - updated
        return age < timedelta(hours=CACHE_HOURS)
    except Exception:
        return False

def mark_cache(zip_code, data_type):
    return supabase_upsert(
        'cache_status',
        [{
            'zip': zip_code,
            'data_type': data_type,
            'updated_at': datetime.utcnow().isoformat()
        }],
        on_conflict='zip,data_type'
    )

# ============================================================
# RENTCAST — LISTINGS
# ============================================================
def fetch_listings(zip_code):
    if not FETCH_LISTINGS:
        return []

    if is_cache_fresh(zip_code, 'listings'):
        print(f"  [{zip_code}] Listings cache fresh, skipping")
        return []

    try:
        r = requests.get(
            "https://api.rentcast.io/v1/listings/sale",
            params={"zipCode": zip_code, "status": "Active", "limit": 50},
            headers={"X-Api-Key": RENTCAST_KEY},
            timeout=20
        )

        if r.status_code == 200:
            data = r.json()
            listings = data if isinstance(data, list) else data.get("listings", [])
            mark_cache(zip_code, 'listings')
            return listings

        if r.status_code == 429:
            print(f"  [{zip_code}] Rate limited — waiting 60s")
            time.sleep(60)
            return []

        print(f"  [{zip_code}] Listings error: {r.status_code} — {r.text[:200]}")
        return []

    except Exception as e:
        print(f"  [{zip_code}] Listings exception: {e}")
        return []

# ============================================================
# RENTCAST — MARKET STATS
# ============================================================
def fetch_market_stats(zip_code):
    if not FETCH_MARKET_STATS:
        return {}

    if is_cache_fresh(zip_code, 'market_stats'):
        print(f"  [{zip_code}] Market stats cache fresh, skipping")
        return {}

    try:
        r = requests.get(
            "https://api.rentcast.io/v1/markets",
            params={"zipCode": zip_code},
            headers={"X-Api-Key": RENTCAST_KEY},
            timeout=20
        )

        if r.status_code == 200:
            mark_cache(zip_code, 'market_stats')
            return r.json()

        if r.status_code == 429:
            print(f"  [{zip_code}] Rate limited — waiting 60s")
            time.sleep(60)
            return {}

        print(f"  [{zip_code}] Market stats error: {r.status_code} — {r.text[:200]}")
        return {}

    except Exception as e:
        print(f"  [{zip_code}] Market stats exception: {e}")
        return {}

# ============================================================
# RENTCAST — OWNERSHIP DATA
# Fetches property records and derives corporate ownership %
# Uses owner.type = "Organization" as primary signal
# ============================================================
def fetch_ownership_data(zip_code):
    if not FETCH_OWNERSHIP_DATA:
        return None

    if is_cache_fresh(zip_code, 'ownership'):
        print(f"  [{zip_code}] Ownership cache fresh, skipping")
        return None

    try:
        all_records = []
        offset = 0
        limit = 500
        max_pages = 4  # cap at 2000 records per ZIP to control cost

        while offset < limit * max_pages:
            r = requests.get(
                "https://api.rentcast.io/v1/properties",
                params={
                    "zipCode": zip_code,
                    "propertyType": "Single Family",
                    "limit": limit,
                    "offset": offset
                },
                headers={"X-Api-Key": RENTCAST_KEY},
                timeout=25
            )

            if r.status_code == 200:
                data = r.json()
                records = data if isinstance(data, list) else data.get("properties", [])

                if not records:
                    break

                all_records.extend(records)

                if len(records) < limit:
                    break

                offset += limit
                time.sleep(0.5)

            elif r.status_code == 429:
                print(f"  [{zip_code}] Rate limited during ownership fetch")
                time.sleep(60)
                break

            else:
                print(f"  [{zip_code}] Ownership fetch error: {r.status_code} — {r.text[:200]}")
                break

        if not all_records:
            return None

        total = len(all_records)
        corporate_count = 0
        corporate_owners = []

        for record in all_records:
            owner = record.get('owner', {}) or {}
            owner_name = owner.get('name', '') or record.get('ownerName', '')
            owner_type = owner.get('type', '')

            if is_corporate(owner_name, owner_type):
                corporate_count += 1
                if owner_name and owner_name not in corporate_owners:
                    corporate_owners.append(owner_name)

        pct = round((corporate_count / total) * 100, 1) if total > 0 else 0
        pct_range = f"{max(0, pct - 5):.0f}–{pct + 5:.0f}%"

        result = {
            'zip': zip_code,
            'total_sampled': total,
            'corporate_count': corporate_count,
            'corporate_pct': pct,
            'corporate_pct_range': pct_range,
            'top_corporate_owners': json.dumps(corporate_owners[:10]),
            'updated_at': datetime.utcnow().isoformat()
        }

        mark_cache(zip_code, 'ownership')
        return result

    except Exception as e:
        print(f"  [{zip_code}] Ownership exception: {e}")
        return None

# ============================================================
# CENSUS — ZIP BOUNDARIES (completely free, no API key)
# Downloads GeoJSON boundaries for any ZIP from Census Bureau
# ============================================================
def fetch_census_boundary(zip_code):
    if not FETCH_CENSUS_BOUNDARIES:
        return None

    if is_cache_fresh(zip_code, 'boundary'):
        print(f"  [{zip_code}] Boundary cache fresh, skipping")
        return None

    try:
        # Census TIGERweb ZCTA layer — correct 2020 ZIP Code Tabulation Areas layer
        url = (
            "https://tigerweb.geo.census.gov/arcgis/rest/services/"
            "TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1/query"
        )

        r = requests.get(
            url,
            params={
                "where": f"GEOID='{zip_code}'",
                "outFields": "GEOID,BASENAME,NAME",
                "outSR": "4326",
                "f": "geojson"
            },
            timeout=25
        )

        if not r.ok:
            print(f"  [{zip_code}] Boundary fetch error: {r.status_code} — {r.text[:200]}")
            return None

        data = r.json()
        features = data.get("features", [])
        if not features:
            print(f"  [{zip_code}] No boundary found from Census")
            return None

        geometry = features[0].get("geometry", {})
        if not geometry:
            print(f"  [{zip_code}] Boundary returned no geometry")
            return None

        boundary = {
            "zip": zip_code,
            "geojson": json.dumps(geometry),
            "updated_at": datetime.utcnow().isoformat()
        }

        mark_cache(zip_code, "boundary")
        return boundary

    except Exception as e:
        print(f"  [{zip_code}] Census boundary exception: {e}")
        return None

# ============================================================
# ON-DEMAND QUEUE
# Reads which ZIPs users have searched but don't have fresh data
# ============================================================
def get_on_demand_queue():
    try:
        rows = supabase_get(
            'search_queue',
            'processed=eq.false&select=zip&order=created_at.asc&limit=20'
        )
        return [r['zip'] for r in rows] if rows else []
    except Exception:
        return []

def clear_queue(zip_codes):
    for z in zip_codes:
        supabase_upsert(
            'search_queue',
            [{'zip': z, 'processed': True}],
            on_conflict='zip'
        )

# ============================================================
# PROCESS A SINGLE ZIP
# ============================================================
def process_zip(zip_code):
    print(f"Processing {zip_code}...")
    properties = []
    market_row = None
    ownership_row = None
    boundary_row = None

    # Listings
    listings = fetch_listings(zip_code)
    for l in listings:
        lat = l.get('latitude')
        lng = l.get('longitude')
        if lat is None or lng is None:
            continue

        price = l.get('price')
        beds = l.get('bedrooms')
        baths = l.get('bathrooms')

        properties.append({
            'zip': zip_code,
            'address': l.get('formattedAddress', ''),
            'price': price,
            'beds': beds,
            'baths': baths,
            'days_on_market': l.get('daysOnMarket', 0),
            'lat': lat,
            'lng': lng,
            'type': 'listed',
            'detail': f"Listed · ${price or 0:,} · {beds or '?'}bd/{baths or '?'}ba",
            'updated_at': datetime.utcnow().isoformat()
        })

    # Market stats
    stats = fetch_market_stats(zip_code)
    if stats:
        market_row = {
            'zip': zip_code,
            'median_price': stats.get('averageSalePrice') or stats.get('medianSalePrice'),
            'avg_days_on_market': stats.get('averageDaysOnMarket'),
            'active_listings': len(listings) if listings else None,
            'updated_at': datetime.utcnow().isoformat()
        }

    # Ownership
    ownership_row = fetch_ownership_data(zip_code)

    # Census boundary
    boundary_row = fetch_census_boundary(zip_code)

    # Write to Supabase
    if properties:
        supabase_delete('properties', f'zip=eq.{zip_code}&type=eq.listed')
        ok = supabase_upsert('properties', properties)
        if ok:
            print(f"  Saved {len(properties)} listings")

    if market_row:
        ok = supabase_upsert('market_stats', [market_row], on_conflict='zip')
        if ok:
            print("  Saved market stats")

    if ownership_row:
        ok = supabase_upsert('ownership_stats', [ownership_row], on_conflict='zip')
        if ok:
            print(f"  Saved ownership data: {ownership_row['corporate_pct_range']} corporate")

    if boundary_row:
        ok = supabase_upsert('zip_boundaries', [boundary_row], on_conflict='zip')
        if ok:
            print("  Saved census boundary")

    print(f"  Done with {zip_code}")

# ============================================================
# MAIN
# ============================================================
def main():
    print(f"\nFirst Dibs data update — {datetime.now()}")
    print("=" * 50)

    safety_check()

    zips_to_process = []

    if ON_DEMAND_ONLY:
        queue = get_on_demand_queue()
        if queue:
            print(f"On-demand queue: {queue}")
            zips_to_process = queue
        else:
            print("On-demand queue empty — nothing to fetch")
    else:
        zips_to_process = ENABLED_ZIPS
        print(f"Pre-fetch mode: {len(zips_to_process)} ZIPs")

    if not zips_to_process:
        print("No ZIPs to process. Done.")
        return

    for zip_code in zips_to_process:
        process_zip(zip_code)
        time.sleep(1)

    if ON_DEMAND_ONLY and zips_to_process:
        clear_queue(zips_to_process)

    print(f"\nUpdate complete — {datetime.now()}")
    print(f"Processed {len(zips_to_process)} ZIPs")

if __name__ == "__main__":
    main()
