const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Błąd przy otwieraniu bazy danych:', err.message)
  } else {
    console.log('Połączono z bazą SQLite')

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT UNIQUE,
         password TEXT,
         google_id TEXT UNIQUE,
         display_name TEXT,
         email TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('Błąd przy tworzeniu tabeli users:', err.message)
        } else {
          console.log("Tabela 'users' jest gotowa")
          db.get(
            'SELECT * FROM users WHERE username = ?',
            ['user'],
            (err, row) => {
              if (err) {
                console.error('Błąd przy sprawdzaniu użytkownika:', err.message)
              } else if (!row) {
                const hashedPassword = bcrypt.hashSync('password', SALT_ROUNDS)
                db.run(
                  'INSERT INTO users (username, password) VALUES (?, ?)',
                  ['user', hashedPassword],
                  (err) => {
                    if (err) {
                      console.error(
                        'Błąd przy dodawaniu przykładowego użytkownika:',
                        err.message,
                      )
                    } else {
                      console.log(
                        'Przykładowy użytkownik został dodany: username: user, password: password (zaszyfrowane)',
                      )
                    }
                  },
                )
              }
            },
          )
        }
      },
    )

    db.run(
      `CREATE TABLE IF NOT EXISTS components (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         quantity INTEGER NOT NULL DEFAULT 0,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('Błąd przy tworzeniu tabeli components:', err.message)
        } else {
          console.log("Tabela 'components' jest gotowa")
        }
      },
    )
  }
})

module.exports = db
