const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page, browser);
    return new Proxy(customPage, {
      get(target, property) {
        //including browser in proxy to no need to use browser ever again, since it only used for create and close page
        return customPage[property] || browser[property] || page[property]; //both browser and page has close function,make sure to use browser's close
      },
    });
  }
  constructor(page) {
    this.page = page;
  }

  async login(toUrl) {
    //0. Create a Page instance
    //1. Take an existing userID(from mongoDB) and generate a fake session object with it
    //2. Sign the session object with keygrip
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    //3. Set the session and signature on our Page
    //NOTE - NEED nav to our domain/application before set cookies, which already done in before each
    await this.page.setCookie(
      {
        name: 'session',
        value: session,
      },
      {
        name: 'session.sig',
        value: sig,
      }
    );
    //refresh the page to re-render entire app
    await this.page.goto(toUrl || 'http://localhost:3000');
    // await this.page.waitForSelector('a[href="/auth/logout"]', {
    //   timeout: 50000,
    // });
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  //node app routes
  async get(path) {
    //Note: evaluate function will be as String and throw to Chromium
    //So pass path as args is important
    return await this.page.evaluate(async (_path) => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
    }, path);
  }

  async post(path, data) {
    return await this.page.evaluate(
      async (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => this[method](path, data))
    );
  }
}

module.exports = CustomPage;
