var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/db');

mongoose.Promise = global.Promise;


var Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    
    pseudo     : String,
    password      : String,
    email      : String,
    team    : String,
    firstname   : String,
    createdAt : Date  
});

var user = mongoose.model('user', userSchema)

var bcrypt = require('bcryptjs')
var salt = "$2a$10$d1pLNBpvTeQFnDk/2PFjKu"

module.exports = {

  get: (userId) => {
    return user.findOne({ _id : userId}, function(err, db){
        return db
      })
  },

  getUser: (id) => {
    return user.findOne({ pseudo : id}, function(err, db){
        return db
      })
  },

  count: () => {
    return user.count({}, function(err, c){
      if (err) console.log("error : " + err)
        return c
      })
  },

  getAll: (limit, offset) => {
    return user.find({}).sort({createdAt : 'ascending'}).exec(function(err, docs){  
      if (err) console.log("error : " + err) 
      
      return Promise.all(docs)
    })
  },

  insert: (params) => {
    var hash = bcrypt.hashSync(params.password, salt)

      var no_sql = new user({

        pseudo     : params.pseudo,
        password      : hash,
        email      : params.email,
        team    : params.team,
        firstname   : params.firstname,
        createdAt : Date.now()
      })

    return no_sql.save(function (err) {
      if (err) console.log('Error on saving');
    })
  },

  update: (userId, params) => {
    var hash = bcrypt.hashSync(params.password, salt)

    return user.update({ _id : userId}, { $set : {pseudo : params.pseudo, password : hash, email : params.email, firstname : params.firstname, team : params.team}})
  },

  remove: (userId) => {
    return user.remove({ _id : userId }, function(err){
        if (err) {console.log("erreur " + err)} 
      })
  }
}


