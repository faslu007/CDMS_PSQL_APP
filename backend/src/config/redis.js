const redis = require('redis');

const client = redis.createClient();

client.set('name', 'james');