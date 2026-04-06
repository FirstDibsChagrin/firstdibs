# ============================================================
# FIRST DIBS — FEATURE FLAGS
# ============================================================
# This file controls what runs. Nothing costs money unless
# you explicitly set a flag to True here.
#
# TO ENABLE A FEATURE:
#   1. Change False to True for that feature
#   2. Commit and push to GitHub
#   3. That's it — the next scheduled run will use it
#
# TO DISABLE (and stop spending API calls):
#   1. Change True back to False
#   2. Commit and push
# ============================================================

# --- NATIONAL COVERAGE ---
# When False: only fetches data for ENABLED_ZIPS below (your 12 Cleveland ZIPs)
# When True: fetches data for ALL ZIPs a user has ever searched
NATIONAL_MODE = False

# --- LISTING DATA (costs RentCast API calls) ---
# Fetches active for-sale listings per ZIP
# Free tier: 50 calls/month total across all features
FETCH_LISTINGS = False

# --- MARKET STATS (costs RentCast API calls) ---
# Fetches median price, days on market per ZIP
FETCH_MARKET_STATS = False

# --- CORPORATE OWNERSHIP ESTIMATION (costs RentCast API calls) ---
# Pulls property records, counts org vs individual owners
# Most expensive feature — up to 500 records per ZIP per call
FETCH_OWNERSHIP_DATA = False

# --- CENSUS MAP BOUNDARIES (FREE — no API calls) ---
# Downloads ZIP boundary shapes from Census Bureau (free, no key needed)
# Safe to enable — costs nothing
FETCH_CENSUS_BOUNDARIES = False

# --- ON-DEMAND MODE ---
# When True: only fetches a ZIP when a real user searches it, then caches
# When False: pre-fetches all ENABLED_ZIPS on every run
# Recommended to set True before enabling national mode
ON_DEMAND_ONLY = False

# --- CACHE DURATION ---
# How many hours before re-fetching a ZIP's data
# 24 = once per day, 168 = once per week
CACHE_HOURS = 0

# ============================================================
# WHICH ZIPS TO PRE-FETCH (only used when NATIONAL_MODE=False)
# Add or remove ZIPs here to control exactly what gets fetched
# ============================================================
ENABLED_ZIPS = [
    # Cleveland core 12 — add more as needed
     '44113',  # Ohio City
     '44102',  # Detroit-Shoreway
     '44109',  # Tremont
     '44105',  # Brooklyn Centre
     '44114',  # Downtown
     '44115',  # Midtown
     '44106',  # University Circle
     '44120',  # Shaker Square
     '44103',  # St. Clair-Superior
     '44111',  # Kamm's Corners
     '44107',  # Lakewood
     '44108',  # Glenville
     '44104',
    # ALL COMMENTED OUT — uncomment individual ZIPs to enable them
]

# ============================================================
# COST ESTIMATOR (read-only, for reference)
# ============================================================
# At current RentCast free tier (50 calls/month):
#
# FETCH_LISTINGS only, 12 ZIPs, daily:       360 calls/month  (over limit)
# FETCH_LISTINGS only, 12 ZIPs, weekly:       48 calls/month  (within limit)
# FETCH_MARKET_STATS only, 12 ZIPs, daily:   360 calls/month  (over limit)
# FETCH_MARKET_STATS only, 12 ZIPs, weekly:   48 calls/month  (within limit)
# FETCH_OWNERSHIP_DATA, 12 ZIPs:             ~12 calls/run    (use sparingly)
#
# RECOMMENDATION for free tier:
#   - Enable FETCH_LISTINGS weekly (not daily)
#   - Enable FETCH_MARKET_STATS weekly
#   - Enable FETCH_OWNERSHIP_DATA once a month manually
#   - Keep NATIONAL_MODE = False until you have a paid plan
# ============================================================
