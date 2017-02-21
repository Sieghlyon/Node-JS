const router = require('express').Router()
const User = require('../models/user-mongo')

router.get('/', (req, res, next) => {
  res.format({
    html: () => {
      res.render('users/inscription', {
        user: {},
        action: '/inscription'
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
    !req.body.password || req.body.password === '' ||
    !req.body.email || req.body.email === '' ||
    !req.body.firstname || req.body.firstname === ''
  ) {
    let err = new Error('Bad Request')
    err.status = 400
    return next(err)
  }

  User.insert(req.body).then(() => {
    res.format({
      html: () => {
        res.redirect('/')
      },
      json: () => {
        res.status(201).send({message: 'success'})
      }
    })
  }).catch(next)
})

module.exports = router