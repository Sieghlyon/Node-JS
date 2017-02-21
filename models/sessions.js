const db = require('sqlite')


module.exports = {

  get: (pseudo) => {
    return db.all('SELECT pseudo, password FROM users WHERE pseudo = ? ', pseudo)
  },

  getId: (token) => {
    return db.get('SELECT userId FROM sessions WHERE accessToken = ?', token)
  },

  retrieve: (cookie) => {
    return db.all('SELECT * FROM sessions WHERE accessToken = ?', cookie)
  },

  insert: (params) => {
    
    return db.run(
      'REPLACE INTO sessions (userId, accessToken, createdAt, expiresAt) VALUES (?, ?, ?, ?)',
      params[0],
      params[1],
      Date.now(),
      (Date.now()+5000000))
      
  },

  remove: (token) => {
    return db.run('DELETE FROM sessions WHERE accessToken = ?', token)
  }
}