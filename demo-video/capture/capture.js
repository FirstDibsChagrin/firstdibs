const { open } = require('./lib');
const OUT = process.env.OUT || require('path').join(__dirname, '../public/shots');
const fs = require('fs');
const BOXES = {};
const SELS = { zipInput: '#zipInput', checkBtn: '.search-bar .btn-primary', info: '#info', scoreBadge: '#info .score-badge', statsGrid: '#info .stats-grid', why: '#info .why-score, #info [class*=why]', map: '#map', legend: '#mapLegend', presetDefault: '#preset-default', presetAfford: '#preset-affordability', presetInvestor: '#preset-investor_aware', presetSpeed: '#preset-speed', compareToggle: '#compareToggle', customizeToggle: '#customizeToggle', weightPanel: '#weight-panel', rngCorp: '#rng-corporate_pct', compareInputs: '#compareInputsContainer', comparePanel: '#comparePanel', calcCard: '#calcCard', calcIncome: '#calcIncome', calcCash: '#calcCash', calcDebts: '#calcDebts', calcBtn: '.btn-calc-primary', viewToggle: '#viewToggle', viewAfford: '.view-toggle-btn[data-view=affordability]', tabRisk: '#tab-btn-risk', tabAfford: '#tab-btn-affordability', tabToolkit: '#tab-btn-toolkit', toolkitCard: '#toolkitCard', escalation: '#toolkit-escalation', seeMap: '.btn-see-map', compareCard: '#comparePanel table, #comparePanel', cmp1: '#compareInput1', cmp2: '#compareInput2', cmp3: '#compareInput3', exitCompare: '#exitCompare' };
async function boxes(page, name) {
  const zc = await page.evaluate(() => { const o = {}; if (typeof zipData === 'undefined' || !document.getElementById('map')) return o; const mr = document.getElementById('map').getBoundingClientRect(); for (const z of ['44107', '44118', '44022']) { const l = zipData[z] && zipData[z].layer; if (!l) continue; const p = map.latLngToContainerPoint(l.getBounds().getCenter()); o['zip' + z] = [Math.round(mr.x + p.x), Math.round(mr.y + p.y), 0, 0]; } return o; }).catch(() => ({}));
  BOXES[name] = await page.evaluate((sels) => { const o = {}; for (const [k, s] of Object.entries(sels)) { const e = document.querySelector(s); if (!e) continue; const r = e.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight) o[k] = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; } return o; }, SELS);
  Object.assign(BOXES[name], zc);
}
(async () => {
  const { browser, page } = await open({ viewport: { width: 1440, height: 810 } });
  const shot = async (name, opts = {}) => { await page.waitForTimeout(opts.wait ?? 500); await page.screenshot({ path: `${OUT}/${name}.png`, ...opts.ss }); await boxes(page, name); console.log('ok', name); };
  const el = async (name, sel) => { await page.waitForTimeout(400); const h = await page.addStyleTag({ content: 'nav,.tab-bar,.preset-bar{position:static!important}' }); await page.locator(sel).screenshot({ path: `${OUT}/${name}.png` }); await h.evaluate(n => n.remove()); console.log('ok', name); };
  const scrollTo = async (sel, off = 0) => page.evaluate(([s, o]) => { document.documentElement.style.scrollBehavior = 'auto'; const st = [...document.querySelectorAll('nav,.tab-bar')].filter(x => ['sticky','fixed'].includes(getComputedStyle(x).position)).reduce((a, x) => a + x.offsetHeight, 0); const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o - st); }, [sel, off]);
  const dump = async (sel) => console.log(sel, JSON.stringify(await page.locator(sel).boundingBox()));

  // 1 hero + typing
  await shot('01_hero');
  const input = page.locator('#zipInput');
  for (const v of ['4', '441', '4410', '44107']) { await input.fill(v); await shot(`02_type_${v.length}`, { wait: 150 }); }
  await page.click('button.btn-primary');
  // 2 map overview (before selection we need a clean map) -> capture map after selection too
  await scrollTo('.preset-bar');
  await shot('03_zip_selected');
  await el('03_info_card', '#info');
  await dump('#info'); await dump('#map');
  await page.click('#toggleFactors').catch(() => console.log('no toggleFactors'));
  await el('04_info_all_factors', '#info');

  // presets
  for (const p of ['affordability', 'investor_aware', 'speed', 'default']) {
    await page.evaluate(id => applyPreset(id), p);
    await page.evaluate(() => selectZip('44107'));
    await scrollTo('.preset-bar');
    await shot(`05_preset_${p}`, { wait: 700 });
  }
  // customize weights
  await page.click('#customizeToggle');
  await scrollTo('.preset-bar');
  await shot('06_weights_open', { wait: 600 });
  for (const v of [35, 45, 55, 65, 75, 90]) { await page.evaluate(v => onWeightInput('corporate_pct', v), v); await shot(`06_w_${v}`, { wait: 700 }); }
  await page.evaluate(() => applyPreset('default'));
  await page.click('#customizeToggle');
  await page.waitForTimeout(400);

  // compare
  await page.click('#compareToggle');
  await scrollTo('.preset-bar');
  await shot('07_compare_empty');
  for (const [i, z] of ['44107', '44118', '44022'].entries()) { await page.evaluate(z => addZipToCompare(z), z); await scrollTo('.preset-bar'); await shot(`07_compare_${i + 1}`, { wait: 700 }); }
  await el('07_compare_panel', '#comparePanel');
  await page.evaluate(() => exitCompareMode());

  // affordability
  await page.evaluate(() => switchTab('affordability'));
  await scrollTo('.main', 16);
  await shot('08_afford_empty', { wait: 700 });
  await page.fill('#calcIncome', '62000');
  await page.fill('#calcCash', '15000');
  await page.fill('#calcDebts', '350');
  await page.selectOption('#calcCredit', '680-739');
  await shot('08_afford_filled');
  await page.evaluate(() => runCalculator());
  await scrollTo('.main', 16);
  await shot('09_afford_results_both', { wait: 900 });
  await el('09_calc_card', '#calcCard');
  await page.evaluate(() => setMapView('affordability')); await scrollTo('.main', 16);
  await shot('09_afford_view_afford', { wait: 700 });
  await page.evaluate(() => fitBoundsAffordable()); await scrollTo('.main', 16);
  await shot('09_afford_fit', { wait: 1200 });

  // toolkit
  await page.evaluate(() => switchTab('toolkit'));
  await scrollTo('.main', 16);
  await shot('10_toolkit', { wait: 700 });
  await page.evaluate(() => { document.getElementById('toolkit-escalation').open = true; });
  await shot('10_toolkit_escalation');
  await el('10_toolkit_card', '#toolkitCard');

  // methodology
  await page.goto((process.env.SITE || 'http://localhost:8765/') + 'methodology.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await shot('11_method_top', { wait: 600 });
  for (const id of ['The six factors', 'Help you can apply for']) {
    await page.evaluate(t => { const h = [...document.querySelectorAll('h2')].find(h => h.textContent.includes(t)); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 40); }, id);
    await shot('11_method_' + id.split(' ')[1], { wait: 400 });
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/boxes.json`, JSON.stringify(BOXES, null, 1));

  // mobile
  const m = await open({ viewport: { width: 390, height: 844 }, dsf: 3, mobile: true });
  await m.page.screenshot({ path: `${OUT}/12_mobile_hero.png` });
  await m.page.fill('#zipInput', '44107'); await m.page.click('button.btn-primary');
  await m.page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; const e = document.querySelector('.map-wrapper'); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 140); });
  await m.page.waitForTimeout(600);
  await m.page.screenshot({ path: `${OUT}/12_mobile_map.png` });
  await m.page.evaluate(() => { const e = document.querySelector('#info'); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 120); });
  await m.page.waitForTimeout(400);
  await m.page.screenshot({ path: `${OUT}/12_mobile_info.png` });
  await m.browser.close();
})();
