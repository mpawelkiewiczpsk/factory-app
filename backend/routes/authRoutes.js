const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const passport = require('passport')
const db = require('../db/dbSetup')

const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY
const SECRET_KEY = process.env.SECRET_KEY
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10

let refreshTokens = []

router.post('/register', (req, res) => {
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
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
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
          res.status(201).json({
            message: 'Użytkownik został zarejestrowany',
            id: this.lastID,
            username,
          })
        },
      )
    })
  })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Błąd przy pobieraniu użytkownika:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' })
    }

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

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      email: req.user.emails ? req.user.emails[0].value : null,
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' })
    res.redirect('http://localhost:5173')
  },
)

router.post('/refresh', (req, res) => {
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

router.post('/logout', (req, res) => {
  const { token } = req.body
  refreshTokens = refreshTokens.filter((rt) => rt !== token)
  res.sendStatus(204)
})

module.exports = router
