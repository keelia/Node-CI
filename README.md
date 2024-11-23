# AdvancedNodeStarter

Starting project for a course on Advanced Node @ Udemy

### Setup

- Run `npm install` in the root of the project to install server dependencies
- Change into the client directory and run `npm install --legacy-peer-deps`
- Change back into the root of the project and run `npm run dev` to start the server
- Access the application at `localhost:3000` in your browser

**Important:**
The credentials for the Mongo Atlas DB in `dev.js` are read only. If you attempt to log in without first adding your own connection string (covered later in the course) you will see an error: `[0] MongoError: user is not allowed to do action [insert] on [advnode.users]`

## Redis for cache

`npm install redis`
Get redis client in terminal :
start node

```js
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
//save string
client.set('hi', 'there');
client.get('hi', console.log);
//save nested object value
client.hset('german', 'red', 'rot');
client.hget('german', 'red', console.log);
//Redis can only store number or string in redis, can not store js object in redis
//save JS object
client.set('colors', JSON.stringify({ red: 'rojo' }));
client.get('colors', (err, val) => console.log(JSON.parse(val)));
```

## Integration Test(Mutiple 'Unit' test work togetjer)

### Test Flow

1. Start React and Express App
2. Run npm run test
3. Start JEST test suite
4. Boot up a 'headless' version of Chronmium

- no user interface(tab,window, etc)
- faster than normal browser window, can run directly from command line
- Already installed chromium browser as dependent(package.json - puppeteer)

5. Lanch Chromium & Nav to Application - Programatically instruct Chromium to visit localhost:3000
6. Programatically instruct Chromium to click elements(select DOM element) on the screen
7. Make assertion about content on screen
8. Repeate from 4 - 7

### Test Challenges

1. Need to somehow lunch Chromium programatically and interact with from a test suite
2. How do we make assertions in JEST about stuff thats happening in a Chrome window
3. How do we "simulate" logging in as a user? We're going through Google Auth - somehow convince our server that the Chromium browser is logged into the app by faking a session

- 3.1 Create Page Instance
- 3.2 Take an existing(in MongoDB) user ID and generate a fake session object with it
- 3.3 Sign the session object with [keygrip](https://www.npmjs.com/package/keygrip)(cookies-session ->cookies->keygrip)
- 3.4 Set the session and signature on our Page instance as cookies

### Test Factories

- Session Fatory - To make auth logic reusable
- User Factory - not hardcode a static user id and reuse it every time, instead should create a new user save to MongoDB and use this use

### Test when not loggin in should not be able to create a blog

This way is more close to user behavior instead of let JEST to request the api without credential

1. Create a new chromium browser instance
2. go to localhost:3000 without logging
3. somehow create a POST request that tries to create a blog post - use [page.evaluate](https://pptr.dev/api/puppeteer.page.evaluate)
4. Asset that the request result in an error

## CI

> Process to merge all your code changes into a single branch(remote repo)

### CI Server

Server that runs automatic checks(tests) on the codebase to ensure the changes have not broken anything, before merge your code the remote repo

### CI Flow

1. Developers push code to github
2. CI Server detects that a new push of code has occured
3. CI Server clones project to a cloud-based virtual machine
4. CI Server runs all tests(many kinds of, may be linting, or unit test by mock, or jest test, depends on project needs)
5. If all tests pass, CI Server marks build as 'Passing' and does some optional followup(e.g. send an email, automatically deploy, push notification on Github)

### Setup CI

1. Need a Github account
2. Basic Git knowledge
3. Patience for a lot of configuration

#### CI Providers

- Travis CI
  - Push code to Github
  - Travis auto detects push code
  - Travis clones our project
  - Travis runs tests using a '.travis.yml' file
  - If tests are OK, Travis sends us an email
- Circle CI (~Travis CI)
- Codeship
- AWS Codebuild
