require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()

const PORT = process.env.PORT || 3000

const passport = require('./config/passport')

const authRoutes = require('./routes/authRoutes')
const componentsRoutes = require('./routes/componentsRoutes')

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(passport.initialize())
app.use(cookieParser())

app.use('/', authRoutes)
app.use('/components', componentsRoutes)

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`)
})
