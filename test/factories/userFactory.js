const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = async () =>
  new User({
    googleId: 'randomGoogleId',
    displayName: 'randomDisplayName',
  }).save();
