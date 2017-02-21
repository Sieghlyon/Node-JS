const router = require('express').Router()
const Todo = require('../models/todos-mongo')
const Session = require('../models/sessions-redis')
const User = require('../models/user-mongo')

router.get('/', (req, res, next) => {

  teamUser = req.query.team
  assigneUser = req.query.assigne
  
	let limit = parseInt(req.query.limit) || 20
	let offset = parseInt(req.query.offset) || 0

	if (limit < 1) limit = 1
	else if (limit > 100) limit = 100

	if (offset < 0) offset = 0

  Session.getId(req.cookies["accessToken"]).then((pseudo) =>{

	Promise.all([
	  Todo.getAll(pseudo.userId),
	  Todo.count(pseudo.userId),
    User.getUser(pseudo["userId"])
	]).then((results) => {
    
    if( teamUser != undefined ){
      
      Todo.getTeam(teamUser).then((result) => {

        if (results[2]["team"] == teamUser){
        res.format({
          html: () => {
            res.render('todos/todolist', {
              button: results[2],
              todos: result,
              count: results[1],
              limit: limit,
              offset: offset
            })
          },
          json: () => {
            res.send({
              data: result,
              meta: {
                count: results[1]
              }
            })
          }
        })}
        else{
          res.redirect("/todos")
        }
      })
    }
    else if(assigneUser != undefined ){

      if (results[2]["pseudo"] == assigneUser){
      Todo.getAssigne(assigneUser).then((result) => {
        res.format({
          html: () => {
            res.render('todos/todolist', {
              button: results[2],
              todos: result,
              count: results[1],
              limit: limit,
              offset: offset
            })
          },
          json: () => {
            res.send({
              data: result,
              meta: {
                count: results[1]
              }
            })
          }
        })
      })}else{
        res.redirect("/todos")
      }
    }else{
	    // results[0] => [user, user, user] 
	    // results[1] => {count: ?}
	  res.format({
	    html: () => {
	      res.render('todos/todolist', {
          button: results[2],
	        todos: results[0],
	        count: results[1],
	        limit: limit,
	        offset: offset
	      })
	    },
	    json: () => {
	      res.send({
	        data: results[0],
	        meta: {
	          count: results[1]
	        }
	      })
	    }
	  })
  }
	}).catch(next)
})
})

router.get('/:todo/edit', (req, res, next) => {
  res.format({
    html: () => {
      Todo.get(req.params.todo).then((todoUser) => {             
        if (!todoUser) return next()

        res.render('todos/edit', {
          user: todoUser,
          action: `/todos/${todoUser._id}?_method=put`
        })
      }).catch(next)
    },
    json: () => {
      let err = new Error('Bad Request')
      err.status = 400
      next(err)
    }
  })
})

router.get('/:todo/move', (req, res, next) => {

  Session.getId(req.cookies["accessToken"]).then((pseudo) =>{
      return Todo.move(req.params.todo, pseudo.userId)
    }).then(() => {
      res.format({
        html: () => {
          res.redirect('/todos')
        },
        json: () => {
          res.status(201).send({message: 'success'})
      }
    })
  }).catch(next)
})

router.get('/add', (req, res, next) => {

  Session.getId(req.cookies["accessToken"]).then((pseudo) =>{
  
	res.format({
    html: () => {
      res.render('todos/edit', {
        user: {},
        pseudo: pseudo.userId,
        action: '/todos'
      })
    },
    json: () => {
      let err = new Error('Bad Request')
      err.status = 400
      next(err)
    }
  })
})
})

router.post('/', (req, res, next) => {

  Session.getId(req.cookies["accessToken"]).then((user) =>{

    return User.getUser(user["userId"])
  }).then((resultat) => {
    
	if (
    !req.body.message || req.body.message === ''    
  ) {
    let err = new Error('Bad Request')
    err.status = 400
    return next(err)
  }
  
  Todo.insert(req.body, resultat).then(() => {
    
    res.format({
      html: () => {
        res.redirect('/todos')
      },
      json: () => {
        res.status(201).send({message: 'success'})
      }
    })
  }).catch(next)
})
})

router.delete('/:todo', (req, res, next) => {

	Todo.remove(req.params.todo).then(() => {
    res.format({
      html: () => { res.redirect('/todos') },
      json: () => { res.send({ message: 'success' }) }
    })
  }).catch(next)

})

router.put('/:todo', (req, res, next) => {

  Session.getId(req.cookies["accessToken"]).then((pseudo) => {
    
	Todo.update(req.body, req.params.todo, pseudo["userId"])}).then(() => {
    res.format({
      html: () => { res.redirect('/todos') },
      json: () => { res.send({ message: 'success' }) }
    })
  }).catch(next)	

})

module.exports = router
