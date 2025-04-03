const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')

const app = express()
const PORT = process.env.PORT || 3000

const SECRET_KEY = 'your_secret_key'
const REFRESH_SECRET_KEY = 'your_refresh_secret_key'
const saltRounds = 10

app.use(cors())
app.use(express.json())

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Błąd przy otwieraniu bazy danych:', err.message)
  } else {
    console.log('Połączono z bazą SQLite')

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            username TEXT NOT NULL UNIQUE,
                                            password TEXT NOT NULL
         )`,
      (err) => {
        if (err) {
          console.error('Błąd przy tworzeniu tabeli users:', err.message)
        } else {
          console.log("Tabela 'users' jest gotowa")
          // Dodanie przykładowego użytkownika (tylko raz)
          db.get(
            'SELECT * FROM users WHERE username = ?',
            ['user'],
            (err, row) => {
              if (err) {
                console.error('Błąd przy sprawdzaniu użytkownika:', err.message)
              } else if (!row) {
                const hashedPassword = bcrypt.hashSync('password', saltRounds)
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
                                                 quantity INTEGER NOT NULL DEFAULT 0
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

let refreshTokens = []

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Endpoint rejestracji użytkownika
app.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username oraz password są wymagane' })
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Błąd przy sprawdzaniu użytkownika:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    if (row) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' })
    }
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Błąd przy haszowaniu hasła:', err.message)
        return res.status(500).json({ error: 'Błąd serwera' })
      }
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hash],
        function (err) {
          if (err) {
            console.error('Błąd przy dodawaniu użytkownika:', err.message)
            return res.status(500).json({ error: 'Błąd serwera' })
          }
          res
            .status(201)
            .json({
              message: 'Użytkownik został zarejestrowany',
              id: this.lastID,
              username,
            })
        },
      )
    })
  })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Błąd przy pobieraniu użytkownika:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' })
    }

    // Porównanie podanego hasła z hashem zapisanym w bazie
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('Błąd przy porównywaniu haseł:', err.message)
        return res.status(500).json({ error: 'Błąd serwera' })
      }
      if (!result) {
        return res.status(401).json({ error: 'Nieprawidłowe dane logowania' })
      }

      const payload = { username: user.username }
      const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' })
      const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
        expiresIn: '1h',
      })
      refreshTokens.push(refreshToken)

      res.json({ accessToken, refreshToken })
    })
  })
})

app.post('/refresh', (req, res) => {
  const { token } = req.body
  if (!token) return res.sendStatus(401)
  if (!refreshTokens.includes(token)) return res.sendStatus(403)

  jwt.verify(token, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403)

    const payload = { username: user.username }
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: '1h',
    })

    refreshTokens = refreshTokens.filter((rt) => rt !== token)
    refreshTokens.push(refreshToken)

    res.json({ accessToken, refreshToken })
  })
})

app.post('/logout', (req, res) => {
  const { token } = req.body
  refreshTokens = refreshTokens.filter((rt) => rt !== token)
  res.sendStatus(204)
})

app.get('/components', authenticateToken, (req, res) => {
  db.all('SELECT * FROM components', [], (err, rows) => {
    if (err) {
      console.error('Błąd przy pobieraniu komponentów:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    res.json(rows)
  })
})

app.get('/components/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  db.get('SELECT * FROM components WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Błąd przy pobieraniu komponentu:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    if (!row) {
      return res.status(404).json({ error: 'Komponent nie znaleziony' })
    }
    res.json(row)
  })
})

app.post('/components', authenticateToken, (req, res) => {
  const { name, quantity } = req.body
  if (!name) {
    return res.status(400).json({ error: "Pole 'name' jest wymagane" })
  }
  if (quantity === undefined) {
    return res.status(400).json({ error: "Pole 'quantity' jest wymagane" })
  }
  const sql = 'INSERT INTO components (name, quantity) VALUES (?, ?)'
  db.run(sql, [name, quantity], function (err) {
    if (err) {
      console.error('Błąd przy dodawaniu komponentu:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    db.get(
      'SELECT * FROM components WHERE id = ?',
      [this.lastID],
      (err, row) => {
        if (err) {
          console.error(
            'Błąd przy pobieraniu dodanego komponentu:',
            err.message,
          )
          return res.status(500).json({ error: 'Błąd serwera' })
        }
        res.status(201).json(row)
      },
    )
  })
})

app.put('/components/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  const { name, quantity } = req.body
  if (!name) {
    return res.status(400).json({ error: "Pole 'name' jest wymagane" })
  }
  if (quantity === undefined) {
    return res.status(400).json({ error: "Pole 'quantity' jest wymagane" })
  }
  const sql = 'UPDATE components SET name = ?, quantity = ? WHERE id = ?'
  db.run(sql, [name, quantity, id], function (err) {
    if (err) {
      console.error('Błąd przy aktualizacji komponentu:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Komponent nie znaleziony' })
    }
    db.get('SELECT * FROM components WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Błąd przy pobieraniu komponentu:', err.message)
        return res.status(500).json({ error: 'Błąd serwera' })
      }
      res.json(row)
    })
  })
})

app.delete('/components/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  const sql = 'DELETE FROM components WHERE id = ?'
  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Błąd przy usuwaniu komponentu:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Komponent nie znaleziony' })
    }
    res.sendStatus(204)
  })
})

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`)
})
