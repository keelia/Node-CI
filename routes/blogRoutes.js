const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');
const { clearHash } = require('../services/cache');
const Blog = mongoose.model('Blog');

module.exports = (app) => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id,
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    //reach out to mongoDB directly
    // const blogs = await Blog.find({ _user: req.user.id });

    // //V1 - redis cache
    // //keep query keys consistent but unique between query executions
    // //e.g. different users use same query should have different results
    // const redis = require('redis');
    // const redisUrl = 'redis://127.0.0.1:6379';
    // const redisClient = redis.createClient(redisUrl);
    // //do we have any cached data in redis related to this query
    // const util = require('util');
    // redisClient.get = util.promisify(redisClient.get);
    // const cachedBlogs = await redisClient.get(req.user.id);
    // //if yes, then response to this request right w away and return
    // if (cachedBlogs) {
    //   console.log('SERVING FROM CACHE');
    //   return res.send(JSON.parse(cachedBlogs));
    // }
    // //otherwise, need to response to request and update cache to store the data
    // const blogs = await Blog.find({ _user: req.user.id });
    // console.log('SERVING FROM MONGODB');
    // res.send(blogs);
    // redisClient.set(req.user.id, JSON.stringify(blogs));

    //V2 - make redis cache reusable and can be toggled
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id,
    });
    res.send(blogs);
  });

  //use cleanCache middleware to auto clean cache after create a new blog
  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id,
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
    //kill this user's cache
    //clearHash(req.user.id);
  });
};
