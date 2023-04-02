const redis = require('redis');
const { promisify } = require('util');

// connection
const redisClient = redis.createClient();


// Promisify Redis commands for easier use with async/await
redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
redisClient.quitAsync = promisify(redisClient.quit).bind(redisClient);
redisClient.delAsync = promisify(redisClient.del).bind(redisClient);


module.exports = redisClient;