const express = require('express')
var bcrypt = require('bcryptjs')
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const router = require('express').Router()
const Session = require('../models/sessions-redis')

const db = require('sqlite')
const app = express()


module.exports = authentication

function authentication(req, res, next){

	if(req.cookies["accessToken"] == undefined){
			res.format({
			html: () => {res.redirect('/sessions')} ,
			json : () => {let err = new Error('Connection refuse')
		    err.status = 403
		    next(err)}
		})
		}

	Session.retrieve(req.cookies["accessToken"]).then((token) =>{
	
	if (token.expiresAt <= Date.now())
		{
			Session.remove(req.cookies["accessToken"]).then(() => {
				res.redirect('/sessions')
			})
			
		}
	else{
	res.format({
		html: () => { if (req.cookies["accessToken"] == token.accessToken){
			
			next()
			
		}else{
			res.redirect('/sessions');
		}
	},
		json: () => { if(req.header['accessToken'] == token.accessToken){

			next()
			
		}else{
			let err = new Error('Connection refuse')
		    err.status = 403
		    next(err)
		    
		}
		}
	})
	}
})
	
}