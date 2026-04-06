import os
import requests
import json
from datetime import datetime

RENTCAST_KEY = os.environ.get("RENTCAST_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

ZIPS = [
    '44113','44102','44109','44105','44114',
    '44115','44106','44120','44103','44111','44107','44108'
]

CORPORATE_KEYWORDS = [
    'LLC','L.L.C','Holdings','Residential','Partners','Capital',
    'Trust','Investments','Realty','Properties','Group','Homes',
    'Assets','Ventures','Acquisitions','Management','Real Estate',
    'Rental','Rentals','Fund','Equity','Investment'
]

def is_corporate(owner_name):
    if not owner_name:
        return False
    name_upper = owner_name.upper()
    return any(k.upper() in name_upper for k in CORPORATE_KEYWORDS)

def supabase_request(method, table, data=None, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    if method == "DELETE":
        headers["Prefer"] = "return=minimal"
    response = requests.request(
        method, url,
        headers=headers,
        json=data,
        params=params
    )
    return response

def fetch_listings(zip_code):
    try:
        r = requests.get(
            "https://api.rentcast.io/v1/listings/sale",
            params={"zipCode": zip_code, "status": "Active", "limit": 50},
            headers={"X-Api-Key": RENTCAST_KEY},
            timeout=10
        )
        if r.status_code == 200:
            data = r.json()
            return data if isinstance(data, list) else data.get("listings", [])
        else:
            print(f"RentCast error for {zip_code}: {r.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching listings for {zip_code}: {e}")
        return []

def fetch_market_stats(zip_code):
    try:
        r = requests.get(
            "https://api.rentcast.io/v1/markets",
            params={"zipCode": zip_code},
            headers={"X-Api-Key": RENTCAST_KEY},
            timeout=10
        )
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception as e:
        print(f"Error fetching market stats for {zip_code}: {e}")
        return {}

def run_daily_update():
    print(f"Starting daily update at {datetime.now()}")
    all_properties = []
    market_stats = []

    for zip_code in ZIPS:
        print(f"Processing ZIP {zip_code}...")
        listings = fetch_listings(zip_code)
        stats = fetch_market_stats(zip_code)

        for listing in listings:
            address = listing.get("formattedAddress", "")
            lat = listing.get("latitude")
            lng = listing.get("longitude")
            if not lat or not lng or not address:
                continue

            all_properties.append({
                "zip": zip_code,
                "address": address,
                "price": listing.get("price"),
                "beds": listing.get("bedrooms"),
                "baths": listing.get("bathrooms"),
                "days_on_market": listing.get("daysOnMarket", 0),
                "lat": lat,
                "lng": lng,
                "type": "listed",
                "detail": f"Listed · ${listing.get('price', 0):,} · {listing.get('bedrooms', '?')}bd/{listing.get('bathrooms', '?')}ba",
                "updated_at": datetime.utcnow().isoformat()
            })

        if stats:
            median_price = stats.get("averageSalePrice") or stats.get("medianSalePrice")
            avg_dom = stats.get("averageDaysOnMarket")
            market_stats.append({
                "zip": zip_code,
                "median_price": median_price,
                "avg_days_on_market": avg_dom,
                "active_listings": len(listings),
                "updated_at": datetime.utcnow().isoformat()
            })

        print(f"  Found {len(listings)} listings for {zip_code}")

    print(f"Clearing old property data...")
    supabase_request("DELETE", "properties", params={"type": "eq.listed"})

    if all_properties:
        print(f"Inserting {len(all_properties)} properties...")
        batch_size = 50
        for i in range(0, len(all_properties), batch_size):
            batch = all_properties[i:i+batch_size]
            resp = supabase_request("POST", "properties", data=batch)
            if resp.status_code not in [200, 201]:
                print(f"Error inserting batch: {resp.text}")

    if market_stats:
        print(f"Updating market stats for {len(market_stats)} ZIPs...")
        for stat in market_stats:
            supabase_request(
                "POST", "market_stats",
                data=stat,
                params=None
            )

    print(f"Update complete at {datetime.now()}")
    print(f"Total properties updated: {len(all_properties)}")

if __name__ == "__main__":
    run_daily_update()
