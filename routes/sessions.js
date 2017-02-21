const router = require('express').Router()
const Session = require('../models/sessions-redis')

var bcrypt = require('bcryptjs')
var crypt 
require('crypto').randomBytes(48, function(err, buffer) {
let token = buffer.toString('hex')
crypt = token
})

const cookie = require("cookie-parser")

var salt = "$2a$10$d1pLNBpvTeQFnDk/2PFjKu"


router.get('/', (req, res, next) => {
    res.format({
      html: () => {
        res.render('sessions/form', {
     		user: {},
        	action: '/sessions'
        })
      },
      json: () => {
      let err = new Error('Bad Request')
      err.status = 400
      next(err)
      }
	})
})
     

router.post('/', (req, res, next) => {

	if (
	    !req.body.pseudo || req.body.pseudo === '' ||
	    !req.body.password || req.body.password === '' )
	    {
	    let err = new Error('Bad Request')
	    err.status = 400
	    return next(err)
	}

  Session.get(req.body.pseudo).then((user) => {

  	var token = []
	token.push(req.body.pseudo)
	token.push(crypt)

	if(user == "" ){
		res.redirect('/sessions')
	}
  	
  	else if(req.body.pseudo == user.pseudo && bcrypt.compareSync(req.body.password, user.password) )
  	{

		Session.insert(token).then(() => {

		   res.format({
		    html: () => {
		    	
		      	res.cookie('accessToken', crypt);
		        res.redirect('/todos')
		    },
		    json: () => {
		        res.status(201).send({accessToken: crypt})
		        res.redirect('/todos')
		    }
		    })
		}).catch(next)
  	}else{
  		
  		res.redirect('/sessions')
  	}	
})
})


router.delete('/', (req, res, next) => {
	res.cookie('accessToken', undefined);
	Session.remove(req.cookies["accessToken"]).then(() => {
		res.redirect('/sessions')
	}).catch(next)
})

module.exports = router
