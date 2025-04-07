const express = require('express')
const router = express.Router()
const db = require('../db/dbSetup')
const { authenticateToken } = require('../middlewares/authMiddleware')

router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM components', [], (err, rows) => {
    if (err) {
      console.error('Błąd przy pobieraniu komponentów:', err.message)
      return res.status(500).json({ error: 'Błąd serwera' })
    }
    res.json(rows)
  })
})

router.get('/:id', authenticateToken, (req, res) => {
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

router.post('/', authenticateToken, (req, res) => {
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

router.put('/:id', authenticateToken, (req, res) => {
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

router.delete('/:id', authenticateToken, (req, res) => {
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

module.exports = router
