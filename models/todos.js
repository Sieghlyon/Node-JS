const db = require('sqlite')

module.exports = {

	get: (userId) => {
    return db.get('SELECT rowid, * FROM todos WHERE rowid = ?', userId)
    },

  getId: (token) => {
    return db.get('SELECT userId FROM sessions WHERE rowid = ?', token)
    },

  count: () => {
    return db.get('SELECT COUNT(*) as count FROM todos')
    },

	getAll: (pseudo) => {
	  return db.all('SELECT rowid, * FROM todos WHERE userId = ?', pseudo )
	},

	insert: (params, pseudo) => {
    
    var etat 
    if(params.completed){
      etat = "Terminer le" + Date.now()
    }else{
      etat = "En cours"
    }
    
    return db.run(
      'INSERT INTO todos (userId, message, createdAt, updatedAt, completedAt) VALUES (?, ?, ?, ?, ?)',
      pseudo,
      params.message,
      Date.now(),
      " ",
      etat
    )
  },

  update: (userId, params) => {
    const POSSIBLE_KEYS = [ "message",  "updatedAt", "completedAt" ]

    let dbArgs = []
    let queryArgs = []

    params["updatedAt"] = Date.now()

    var etat 
    if(params.completed){
      etat = "Terminer le" + Date.now()
    }else{
      etat = "En cours"
    }

    params["completedAt"] = etat


    for (key in params) {
      if (-1 !== POSSIBLE_KEYS.indexOf(key)) {
        queryArgs.push(`${key} = ?`)
        dbArgs.push(params[key])
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

    let query = 'UPDATE todos SET ' + queryArgs.join(', ') + ' WHERE rowid = ?'

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
    	return db.run('DELETE FROM todos WHERE rowid = ?', userId)
    }
}