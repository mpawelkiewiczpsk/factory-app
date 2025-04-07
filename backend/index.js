require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const PORT = process.env.PORT || 3000

const passport = require('./config/passport')

const authRoutes = require('./routes/authRoutes')
const componentsRoutes = require('./routes/componentsRoutes')

app.use(cors())
app.use(express.json())
app.use(passport.initialize())

app.use('/', authRoutes)
app.use('/components', componentsRoutes)

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`)
})
