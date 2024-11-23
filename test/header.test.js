const Page = require('./helpers/page');

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3001');
});

afterEach(async () => {
  await page.close();
});

test('Header has correct text', async () => {
  const logoText = await page.getContentsOf('a.left.brand-logo');
  expect(logoText).toEqual('Blogster');
});

test('Clicking login starts oauth flow', async () => {
  await page.click('ul.right a');
  const pageUrl = await page.url();
  expect(pageUrl).toMatch(/^https:\/\/accounts\.google\.com\//);
});

test('When signed in, shows logout button', async () => {
  await page.login();
  const logout = await page.getContentsOf('a[href="/auth/logout"]');
  expect(logout).toEqual('Logout');
});
