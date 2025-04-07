const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Błąd przy otwieraniu bazy danych:', err.message)
  } else {
    console.log('Połączono z bazą SQLite')
  }
})

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      db.get(
        'SELECT * FROM users WHERE google_id = ?',
        [profile.id],
        (err, row) => {
          if (err) {
            console.error('Błąd przy pobieraniu użytkownika:', err.message)
            return done(err)
          }
          if (!row) {
            const displayName = profile.displayName || null
            const email =
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null

            db.run(
              'INSERT INTO users (google_id, display_name, email) VALUES (?, ?, ?)',
              [profile.id, displayName, email],
              function (err) {
                if (err) {
                  console.error('Błąd przy dodawaniu użytkownika:', err.message)
                  return done(err)
                }
                db.get(
                  'SELECT * FROM users WHERE id = ?',
                  [this.lastID],
                  (err, newUser) => {
                    if (err) {
                      console.error(
                        'Błąd przy pobieraniu nowego użytkownika:',
                        err.message,
                      )
                      return done(err)
                    }
                    return done(null, newUser)
                  },
                )
              },
            )
          } else {
            return done(null, row)
          }
        },
      )
    },
  ),
)

module.exports = passport
