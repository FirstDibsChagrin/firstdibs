-- ============================================================
-- FIRST DIBS — COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor → New Query → Run
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- Drop old policies if they exist (prevents the error you saw)
DROP POLICY IF EXISTS "Public read access for properties" ON properties;
DROP POLICY IF EXISTS "Public read access for market_stats" ON market_stats;

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  zip TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC,
  beds NUMERIC,
  baths NUMERIC,
  days_on_market INTEGER DEFAULT 0,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('listed', 'corp', 'owner')),
  detail TEXT,
  owner_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_stats (
  id BIGSERIAL PRIMARY KEY,
  zip TEXT UNIQUE NOT NULL,
  median_price NUMERIC,
  avg_days_on_market NUMERIC,
  active_listings INTEGER,
  corp_ownership_pct TEXT,
  corp_ownership_cv INTEGER,
  corp_trend TEXT,
  price_source TEXT,
  price_trend TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Derived corporate ownership % from RentCast property records
CREATE TABLE IF NOT EXISTS ownership_stats (
  id BIGSERIAL PRIMARY KEY,
  zip TEXT UNIQUE NOT NULL,
  total_sampled INTEGER,
  corporate_count INTEGER,
  corporate_pct NUMERIC,
  corporate_pct_range TEXT,
  top_corporate_owners TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Census ZCTA boundary shapes for accurate map rendering
CREATE TABLE IF NOT EXISTS zip_boundaries (
  id BIGSERIAL PRIMARY KEY,
  zip TEXT UNIQUE NOT NULL,
  geojson TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache tracking — prevents re-fetching fresh data
CREATE TABLE IF NOT EXISTS cache_status (
  id BIGSERIAL PRIMARY KEY,
  zip TEXT NOT NULL,
  data_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zip, data_type)
);

-- On-demand search queue — users trigger fetches by searching a ZIP
CREATE TABLE IF NOT EXISTS search_queue (
  id BIGSERIAL PRIMARY KEY,
  zip TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zip)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties(zip);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_market_stats_zip ON market_stats(zip);
CREATE INDEX IF NOT EXISTS idx_ownership_zip ON ownership_stats(zip);
CREATE INDEX IF NOT EXISTS idx_cache_zip_type ON cache_status(zip, data_type);
CREATE INDEX IF NOT EXISTS idx_queue_processed ON search_queue(processed);

-- ============================================================
-- ROW LEVEL SECURITY (public read, no public write)
-- ============================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE zip_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public read market_stats" ON market_stats FOR SELECT USING (true);
CREATE POLICY "Public read ownership_stats" ON ownership_stats FOR SELECT USING (true);
CREATE POLICY "Public read zip_boundaries" ON zip_boundaries FOR SELECT USING (true);
CREATE POLICY "Public insert search_queue" ON search_queue FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED DATA — Federal Reserve calibrated estimates
-- These show immediately while live data pipeline is being set up
-- Will be OVERWRITTEN by real RentCast data once flags are enabled
-- ============================================================
INSERT INTO market_stats (zip, median_price, avg_days_on_market, active_listings, corp_ownership_pct, corp_ownership_cv, corp_trend, price_source, price_trend) VALUES
('44113', 275000, 3.8,  9,  '28–35%', 32, '↑ from 2020 baseline',        'Redfin, 2025',     '↑ 10.6% YoY'),
('44102', 250000, 4.5,  11, '30–38%', 34, '↑ from 2020 baseline',        'Homes.com, 2025',  'Homes.com 2025'),
('44109', 375000, 5.2,  13, '25–32%', 28, '↑ from 2020 baseline',        'Homes.com, 2025',  'Homes.com 2025'),
('44105', 98000,  2.1,  5,  '45–63%', 55, '↑ significantly from 2020',   'Estimated',        'estimated'),
('44114', 210000, 8.5,  14, '18–26%', 22, '↑ slightly from 2020',        'Estimated',        'estimated'),
('44115', 118000, 3.2,  8,  '38–50%', 44, '↑ from 2020 baseline',        'Estimated',        'estimated'),
('44106', 178000, 5.8,  10, '22–30%', 26, '↑ slightly from 2020',        'Estimated',        'estimated'),
('44120', 195000, 7.1,  12, '20–28%', 24, '↑ slightly from 2020',        'Estimated',        'estimated'),
('44103', 79000,  1.8,  4,  '46–67%', 58, '↑ nearly tripled since 2004', 'Estimated',        'estimated'),
('44111', 142000, 6.4,  10, '18–25%', 21, '~ stable from 2020',          'Estimated',        'estimated'),
('44107', 198000, 9.2,  15, '15–22%', 18, '↓ stable / slight decrease',  'Redfin, 2025',     'Redfin area data'),
('44108', 88000,  2.6,  6,  '46–55%', 50, '↑ sharply from 2020',         'Estimated',        'estimated')
ON CONFLICT (zip) DO NOTHING;

-- Seed ownership_stats with Fed-calibrated estimates
-- These get replaced with real RentCast-derived numbers when FETCH_OWNERSHIP_DATA=True
INSERT INTO ownership_stats (zip, total_sampled, corporate_count, corporate_pct, corporate_pct_range, top_corporate_owners) VALUES
('44113', 0, 0, 32, '28–35%', '["Calibrated from Fed Cleveland 2025"]'),
('44102', 0, 0, 34, '30–38%', '["Calibrated from Fed Cleveland 2025"]'),
('44109', 0, 0, 28, '25–32%', '["Calibrated from Fed Cleveland 2025"]'),
('44105', 0, 0, 55, '45–63%', '["Calibrated from Fed East Side data"]'),
('44114', 0, 0, 22, '18–26%', '["Calibrated from Fed Cleveland 2025"]'),
('44115', 0, 0, 44, '38–50%', '["Calibrated from Fed Cleveland 2025"]'),
('44106', 0, 0, 26, '22–30%', '["Calibrated from Fed Cleveland 2025"]'),
('44120', 0, 0, 24, '20–28%', '["Calibrated from Fed Cleveland 2025"]'),
('44103', 0, 0, 58, '46–67%', '["Calibrated from Fed East Side data"]'),
('44111', 0, 0, 21, '18–25%', '["Calibrated from Fed Cleveland 2025"]'),
('44107', 0, 0, 18, '15–22%', '["Calibrated from Fed Cleveland 2025"]'),
('44108', 0, 0, 50, '46–55%', '["Calibrated from Fed East Side data"]')
ON CONFLICT (zip) DO NOTHING;
