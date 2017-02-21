
const Redis = require('ioredis')
var redis = new Redis();
const User = require('../models/user-mongo')


module.exports = {

  get: (pseudo) => {
    return User.getUser(pseudo)
  },

  getId: (token) => {
    return redis.hgetall(`sessions:${token}`)
  },

  retrieve: (cookie) => {
  	
    return redis.hgetall(`sessions:${cookie}`)
  },

  insert: (params) => {
    let pipeline = redis.pipeline()
    let sessionId = params[1]
    console.log(`sessions:${sessionId}`)
    // {pseudo, email} = {pseudo: pseudo, email: email} en ES6
    pipeline.hmset(`sessions:${sessionId}`,{userId : params[0], accessToken : sessionId, createdAt : Date.now(), expiresAt : Date.now()+50000000})
    pipeline.sadd('sessions', sessionId)
      
    return pipeline.exec()
  },

  remove: (token) => {
  	let sessionId = token
    let pipeline = redis.pipeline()

    pipeline.hdel(`sessions:${sessionId}`, "userId", "accessToken", "createdAt", "expiresAt")
    pipeline.del(`sessions:${sessionId}`)
    pipeline.srem('sessions', sessionId)

    return pipeline.exec()
  }
} 