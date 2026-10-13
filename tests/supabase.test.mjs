import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('script.js', 'utf8');
function siteContext(tables) {
  const queries = [];
  const client = { from(table) {
    const query = { table, orders: [] };
    queries.push(query);
    const chain = {
      select() { return this; }, order(column, options) { query.orders.push([column, options]); return this; },
      limit() { return this; }, maybeSingle() { return this; },
      then(resolve, reject) { return Promise.resolve(tables[table] || { data: null }).then(resolve, reject); }
    };
    return chain;
  } };
  const context = vm.createContext({ React: {}, window: { frilanceSupabase: client }, console: { error() {} } });
  vm.runInContext(source.slice(0, source.indexOf('function Header(')), context);
  return { context, queries };
}
test('Settings read the newest row, and every displayed price comes from it', async () => {
  const { context, queries } = siteContext({ services: { data: { website_price: 'от 200 ₽', neuro_price: 'от 300 ₽', start_price: 'от 400 ₽' } }, texts: { data: { hero_title: 'Из админки' } } });
  const data = await vm.runInContext('loadSiteData()', context);
  assert.equal(data.services[0].price, 'от 200 ₽');
  assert.equal(data.prices[0].value, 'от 400 ₽');
  assert.equal(data.neuroPrices.at(-1)[1], 'от 300 ₽');
  assert.equal(data.texts.hero_title, 'Из админки');
  assert.equal(queries.find(q => q.table === 'texts').orders[0][1].ascending, false);
});
test('An empty portfolio stays empty rather than resurrecting deleted demo work', async () => {
  const { context } = siteContext({ portfolio: { data: [] } });
  const data = await vm.runInContext('loadSiteData()', context);
  assert.equal(data.portfolio.length, 0);
});
test('Gallery retains every related image, without duplicating the cover', async () => {
  const { context } = siteContext({ portfolio: { data: [{ id: 'a', title: 'Работа', image_url: 'one.jpg' }] }, portfolio_images: { data: [{ portfolio_id: 'a', image_url: 'one.jpg' }, { portfolio_id: 'a', image_url: 'two.jpg' }, { portfolio_id: 'b', image_url: 'other.jpg' }] } });
  const data = await vm.runInContext('loadSiteData()', context);
  assert.deepEqual(Array.from(data.portfolio[0].images), ['one.jpg', 'two.jpg']);
});
test('A failing gallery request does not discard the portfolio', async () => {
  const { context } = siteContext({ portfolio: { data: [{ id: 'a', image_url: 'one.jpg' }] }, portfolio_images: { error: { message: 'offline' } } });
  const data = await vm.runInContext('loadSiteData()', context);
  assert.equal(data.portfolio[0].image, 'one.jpg');
});

const admin = fs.readFileSync('admin.js', 'utf8');
test('Portfolio tabs group repeated categories without losing any work', () => {
  const context = vm.createContext({});
  vm.runInContext(source.slice(source.indexOf('function getPortfolioGroups('), source.indexOf('function Portfolio(')), context);
  const groups = vm.runInContext('getPortfolioGroups([{category:"Сайты"},{category:"Нейрофото"},{category:"Карточки товаров"},{category:"САЙТЫ"},{category:"Маркетплейсы"}])', context);
  assert.deepEqual(Array.from(groups, group => group.category), ['САЙТЫ', 'НЕЙРОФОТО', 'КАРТОЧКИ ТОВАРОВ']);
  assert.deepEqual(Array.from(groups[0].indices), [0, 3]);
  assert.deepEqual(Array.from(groups[2].indices), [2, 4]);
});
function adminContext(client) {
  return vm.createContext({ window: { frilanceSupabase: client }, frilanceSupabase: client,
    document: { addEventListener() {} }, console: { log() {}, warn() {}, error() {} },
    crypto: { randomUUID: () => 'stable-id' }, setTimeout, clearTimeout });
}
test('Gallery metadata is an atomic batch with stable IDs on retry', async () => {
  const calls = [];
  const context = adminContext({ from(table) { return { upsert(records) { calls.push({ table, records }); return Promise.resolve({ data: records }); } }; } });
  vm.runInContext(admin, context);
  vm.runInContext('globalThis.files = [{ publicUrl: "a", storagePath: "portfolio/a" }, { publicUrl: "b", storagePath: "portfolio/b" }]', context);
  await vm.runInContext('savePortfolioImageRecords("work", files, "caption")', context);
  await vm.runInContext('savePortfolioImageRecords("work", files, "caption")', context);
  assert.equal(calls[0].records.length, 2);
  assert.equal(calls[0].records[0].storage_path, 'portfolio/a');
  assert.equal(calls[0].records[0].id, calls[1].records[0].id);
});
test('Gallery failures are reported rather than counted as a successful save', async () => {
  const context = adminContext({ from() { return { upsert() { return Promise.resolve({ error: { message: 'missing storage_path' } }); } }; } });
  vm.runInContext(admin, context);
  await assert.rejects(vm.runInContext('savePortfolioImageRecords("work", [{ publicUrl: "a", storagePath: "a" }], "")', context), /missing storage_path/);
});

test('Upload uses the shared bucket, accepts an empty MIME type and reuses successful files', async () => {
  const uploads = [];
  const client = {
    auth: { getSession: async () => ({ data: { session: { user: {} } } }) },
    storage: { from(bucket) { return {
      upload: async (path, file, options) => { uploads.push({ bucket, path, file, options }); return { data: { path } }; },
      getPublicUrl: path => ({ data: { publicUrl: 'https://example.test/' + path } })
    }; } }
  };
  const context = adminContext(client);
  context.window.supabase = { createClient: () => client };
  vm.runInContext(fs.readFileSync('supabase-config.js', 'utf8'), context);
  context.FRILANCE_CONFIG = context.window.FRILANCE_CONFIG;
  context.frilanceImageType = context.window.frilanceImageType;
  vm.runInContext(admin, context);
  vm.runInContext('globalThis.file = { name: "фото.JPG", type: "", size: 100 }', context);
  const first = await vm.runInContext('uploadPortfolioImage(file)', context);
  const second = await vm.runInContext('uploadPortfolioImage(file)', context);
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].bucket, 'portfolio-images');
  assert.equal(uploads[0].options.contentType, 'image/jpeg');
  assert.equal(uploads[0].options.upsert, true);
  assert.equal(first.publicUrl, second.publicUrl);
});
