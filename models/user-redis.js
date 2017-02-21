const Redis = require('ioredis')
var redis = new Redis();
var bcrypt = require('bcryptjs')
var salt = "$2a$10$d1pLNBpvTeQFnDk/2PFjKu"

module.exports = {

  get: (userId) => {
    
    return redis.hgetall(`user:${userId}`)
  },

  count: () => {
    var number = {count: 0}
    return redis.scard('users').then((result) => { number.count = result
      return number}).then((result)=>{return result})
  },

  getAll: (limit, offset) => {
    var liste = []
    let pipeline = redis.pipeline()
    
    return redis.smembers('users').then((result) => {
      let userId
      let j = 0
      for (i = 0 ; i < result.length ; i++){
        userId = result[i]
        
        liste[i] = redis.hgetall(`user:${userId}`)
      }
      return Promise.all(liste)
    }).then((liste) => {return liste })
  },

  insert: (params) => {
      let pipeline = redis.pipeline()
      let userId = require('uuid').v4()
      var hash = bcrypt.hashSync(params.password, salt)

      console.log(`user:${userId}`)
      // {pseudo, email} = {pseudo: pseudo, email: email} en ES6
      pipeline.hmset(`user:${userId}`,{rowid : userId, pseudo : params.pseudo, password: hash, email: params.email, team : params.team, firstname : params.firstname, createdAt : Date.now()})
      pipeline.sadd('users', userId)
      
      return pipeline.exec()
    
  },

  update: (userId, params) => {
    var hash = bcrypt.hashSync(params.password, salt)

    return redis.hmset(`user:${userId}`, {pseudo : params.pseudo, password: hash, email: params.email, firstname : params.firstname})
  },

  remove: (userId) => {
    let pipeline = redis.pipeline()

    pipeline.hdel(`user:${userId}`, "pseudo", "password", "email", "team", "firstname", "createdAt")
    pipeline.del(`user:${userId}`)
    pipeline.srem('users', userId)
    return pipeline.exec()
  }
}


