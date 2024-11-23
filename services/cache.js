const mongoose = require('mongoose');
const redis = require('redis');
// const redisUrl = 'redis://127.0.0.1:6379';
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);
const util = require('util');
client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

//add cache for query to toggle cacheing, still not use arrow function to keep this refers to Query instance
mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true; //this refers to Query instance/which object been called, not apply to all Query instance

  //support top-level cache key, don't have to be userId
  this.hashKey = JSON.stringify(options.key || 'defaultTopKey');

  return this; //to chainable
};

//override/hook mongooes original exec to handle redis cache process
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  //not arrow function to keep this to be prototype
  //use assign function to make a copy instead of modity actual query
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  //see if have value for key in redis
  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    //redis can only handle JSON, but need to return as mongooseDocument/mongoose Model
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map((item) => this.model(item))
      : new this.model(doc);
  }
  const result = await exec.apply(this, arguments);
  //console.log(result.validate);
  //result is a mongooseDocument object, before save to Redis need to be coverted to JSON
  //client.set(key, JSON.stringify(result));
  //Auto Expire cache - 10 seconds
  //BUT still not solve the issue :after creating one blog and refresh the page, it won't be shown
  //since the EX Will be effect on NEXT time
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
};

//programmely expire cache
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey)); //make sure hashkey is string
  },
};
