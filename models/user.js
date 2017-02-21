const db = require('sqlite')
var bcrypt = require('bcryptjs')
var salt = "$2a$10$d1pLNBpvTeQFnDk/2PFjKu"

module.exports = {
  get: (userId) => {
    return db.get('SELECT rowid, * FROM users WHERE rowid = ?', userId)
  },

  count: () => {
    return db.get('SELECT COUNT(*) as count FROM users')
  },

  getAll: (limit, offset) => {
    return db.all('SELECT rowid, * FROM users LIMIT ? OFFSET ?', limit, offset)
  },

  insert: (params) => {
    var hash = bcrypt.hashSync(params.password, salt)
    
    return db.run(
      'INSERT INTO users (pseudo, password, email, firstname, createdAt) VALUES (?, ?, ?, ?, ?)',
      params.pseudo,
      hash,
      params.email,
      params.firstname,
      Date.now()
    )
  },

  update: (userId, params) => {
    const POSSIBLE_KEYS = [ 'pseudo', 'password', 'email', 'firstname' ]

    let dbArgs = []
    let queryArgs = []
    var hash 

    for (key in params) {
      if (-1 !== POSSIBLE_KEYS.indexOf(key)) {
        queryArgs.push(`${key} = ?`)
        if(key === "password"){
          hash = bcrypt.hashSync(params[key], salt)
          dbArgs.push(hash)
        }else{
          dbArgs.push(params[key])
        }
       
      }
    }

    // queryArgs.push('updatedAt = ?')
    // dbArgs.push(Date.now())

    if (!queryArgs.length) {
      let err = new Error('Bad request')
      err.status = 400
      return Promise.reject(err)
    }

    dbArgs.push(userId)

    let query = 'UPDATE users SET ' + queryArgs.join(', ') + ' WHERE rowid = ?'

    //db.run.apply(db, query, dbArgs)
    return db.run(query, dbArgs).then((stmt) => {
      // Ici je vais vérifier si l'updata a bien changé une ligne en base
      // Dans le cas contraire, cela voudra dire qu'il n'y avait pas d'utilisateur
      // Avec db.run, la paramètre passé dans le callback du then, est le `statement`
      // qui contiendra le nombre de lignes éditées en base

      // Si le nombre de lignes dans la table mis à jour est de 0
      if (stmt.changes === 0) {
        let err = new Error('Not Found')
        err.status = 404
        return Promise.reject(err)
      }

      // Tout va bien, on retourne le stmt au prochain then, on fait comme si de rien n'était
      return stmt
    })
  },

  remove: (userId) => {
    return db.run('DELETE FROM users WHERE rowid = ?', userId)
  }
}
