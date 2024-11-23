const Page = require('./helpers/page');

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login('http://localhost:3000/blogs');
    await page.click('a.btn-floating.red');
  });

  test('Can see blog create form', async () => {
    const title = await page.getContentsOf('form label');
    expect(title).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      //achieve using valid inputs and submit the button
      await page.type('form .title input', 'My Title');
      await page.type('form .content input', 'My Content');
      await page.click('form button');
    });

    test('submitting take user to review screen', async () => {
      const reviewMessage = await page.getContentsOf('form h5');
      expect(reviewMessage).toEqual('Please confirm your entries');
    });

    test('submitting then saving added blog to index page', async () => {
      await page.click('form button.green');
      //take some time to nav to blog page, so wait for navigation to occur
      await page.waitFor('.card');

      //every time when run test will create a new user
      //so just pick the first applicablt card is enough
      const title = await page.getContentsOf('.card-content .card-title');
      const content = await page.getContentsOf('.card-content p');
      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      //achieve using invalid inputs and submit the button
      await page.click('form button');
    });

    test('The form shows an error message', async () => {
      const titleMessage = await page.getContentsOf('form .title .red-text');
      const contentMessage = await page.getContentsOf(
        'form .content .red-text'
      );
      expect(titleMessage).toEqual('You must provide a value');
      expect(contentMessage).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs',
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C',
      },
    },
  ];

  test('Blog related actions are progibited', async () => {
    const results = await page.execRequests(actions);
    for (const result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });

  // test('User can not create blog posts', async () => {
  //   const result = await page.post('/api/blogs', {
  //     title: 'Title from API',
  //     content: 'Content from API',
  //   });
  //   expect(result).toEqual({ error: 'You must log in!' });
  // });

  // test('User can not view post', async () => {
  //   const result = await page.get('/api/blogs');
  //   expect(result).toEqual({ error: 'You must log in!' });
  // });
});
