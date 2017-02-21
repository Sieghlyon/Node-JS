var mongoose = require('mongoose');

var db1 = mongoose.createConnection('mongodb://localhost/db');
db1.on('error', console.error.bind(console, 'connection error:'));
db1.once('open', function() {
  // we're connected!
  mongoose.Promise = global.Promise;
});

var Schema = mongoose.Schema;
	ObjectId = Schema.ObjectId;

var TodoSchema = new Schema({
    userId    : String,
    team : String,
    message     : String,
    createdAt      : Date,
    updatedAt      : Date,
    completedAt    : String,
    assigne        : String,
    reporter : Number  
});

var todo = mongoose.model('todo', TodoSchema)

const Redis = require('ioredis')
var redis = new Redis();


module.exports = {

	get: (Id) => {
    	return todo.findOne({ _id : Id}, function(err, db){
    		return db
    	})
    },

 	getId: (id) => {

    	return redis.hgetall(`sessions:${id }`)
  	},

  	getTeam: (team) => {
  		return todo.find({team : team}).sort({reporter : 'ascending'}).exec(function(err, docs){
			
			return Promise.all(docs)
		})
  	},

  	getAssigne: (task) => {
  		return todo.find({assigne : task}).sort({reporter : 'ascending'}).exec(function(err, docs){
			
			return Promise.all(docs)
		})

  	},

  	count: (pseudo) => {
    	return todo.count({userId : pseudo}, function(err, c){
    		return c
    	})
    },

	getAll: (pseudo) => {
		return todo.find({userId : pseudo}).sort({reporter : 'ascending'}).exec(function(err, docs){
			
			return Promise.all(docs)
		})
	},

	insert: (params, user) => {
		var etat 
	    if(params.completed){
	      etat = "Terminer le" + Date.now()
	    }else{
	      etat = "En cours"
	    }
		
    	var no_sql = new todo({
    		userId    : user["pseudo"],
    		team      : user["team"] ,
		    message     : params["message"],
		    createdAt      : Date.now(),
		    updatedAt      : "" ,
		    completedAt    : etat,
		    assigne : "" ,
		    reporter : 0 
    	})

		return no_sql.save(function (err) {
			if (err) console.log('Error on saving');
		});
  	},

  	move : (Id, pseudo) => {
  		return todo.find({userId : pseudo}).sort({reporter : 'ascending'}).exec(function(err, docs){
			return Promise.all(docs)
		}).then((liste) => {
			return todo.update({_id : Id}, {$set : {reporter : (liste[liste.length-1].reporter + 1) }})
		})

  	},

  	update: (params, Id, user) => {
  		
  		var etat 
	    if(params.completed){
	      etat = "Terminer le" + Date.now()
	    }else{
	      etat = "En cours"
	    }
	    var messageUpdated = ( " par " + user + " pour " + params["assigne"])
	    
  		return todo.update({ _id : Id}, { $set : {message : params["message"], assigne : params["assigne"], updatedAt : Date.now(), completedAt : etat }}).exec()
  	},

  	remove: (Id) => {
    	return todo.remove({ _id : Id }, function(err){
    		if (err) {console.log("erreur " + err)} 

    	})
    }
}
