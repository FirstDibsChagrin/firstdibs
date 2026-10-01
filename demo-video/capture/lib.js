const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const LF = path.join(path.dirname(require.resolve('leaflet/package.json')), 'dist');
const INTER = path.join(path.dirname(require.resolve('@fontsource/inter/package.json')), 'files');
async function open(opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1600, height: 900 }, deviceScaleFactor: opts.dsf || 2, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    const m = u.match(/unpkg\.com\/leaflet@1\.9\.4\/dist\/(.*)$/);
    if (m) return route.fulfill({ path: path.join(LF, m[1].split('?')[0]) });
    if (u.includes('fonts.googleapis.com/css')) {
      const css = [300,400,500,600,700,800].map(w => `@font-face{font-family:'Inter';font-style:normal;font-weight:${w};font-display:block;src:url(https://fontfile.local/inter-latin-${w}-normal.woff2) format('woff2');}`).join('\n');
      return route.fulfill({ contentType: 'text/css', body: css });
    }
    const f = u.match(/fontfile\.local\/(.*)$/);
    if (f) return route.fulfill({ path: path.join(INTER, f[1]), contentType: 'font/woff2' });
    if (u.startsWith('http://localhost')) return route.continue();
    // Set TILES=1 when the network allows OpenStreetMap, to include the street basemap.
    if (process.env.TILES && u.includes('tile.openstreetmap.org')) return route.continue();
    return route.abort();
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.goto((process.env.SITE || 'http://localhost:8765/') + (opts.path || 'index.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  return { browser, page };
}
module.exports = { open };
