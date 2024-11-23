const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  //1. Take an userID(from mongoDB) and generate a fake session object with it
  const session = Buffer.from(
    JSON.stringify({
      passport: {
        user: user._id.toString(),
      },
    })
  ).toString('base64');
  //2. Sign the session object with keygrip
  const sig = keygrip.sign(`session=${session}`);
  return {
    session,
    sig,
  };
};
