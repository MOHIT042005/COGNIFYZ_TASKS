// ===== Imports =====
const express = require('express');
require('dotenv').config();
const app = express();

const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const SECRET_KEY = process.env.SECRET_KEY;

// ===== Middleware =====
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ===== View Engine =====
app.set('view engine', 'ejs');

// ===== Database =====
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'userDB'
});

db.connect(err => {
    if (err) console.log(err);
    else console.log("MySQL Connected");
});

// ===== Rate Limiter =====
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Try again later." }
});

// ===== Google OAuth =====
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {

    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {

        if (err) return done(err);

        if (results.length > 0) {
            return done(null, results[0]);
        } else {
            const sql = `
            INSERT INTO users (name, email, password, phone, dob, gender, address, google_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [
                name,
                email,
                "google",
                "0000000000",
                null,
                null,
                null,
                googleId
            ], (err, result) => {

                if (err) return done(err);

                const newUser = {
                    id: result.insertId,
                    name,
                    email,
                    displayName: name,
                    photos: profile.photos
                };

                return done(null, newUser);
            });
        }
    });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ===== Auth Middleware =====
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return next({ status: 401, message: "Access denied" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return next({ status: 403, message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}

// ===== Routes =====

// Home
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

// Register
app.post('/users', (req, res, next) => {

    const { name, email, phone, password, dob, gender, address } = req.body;

    if (!name || !email || !phone || !password) {
        return next({ status: 400, message: "All required fields must be filled" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {

        if (err) return next(err);

        if (results.length > 0) {
            return next({ status: 409, message: "Email already registered" });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {

            if (err) return next(err);

            const sql = `
            INSERT INTO users (name, email, phone, password, dob, gender, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [name, email, phone, hashedPassword, dob, gender, address], (err, result) => {

                if (err) return next(err);

                res.status(201).json({
                    message: "User registered successfully",
                    userId: result.insertId
                });
            });
        });
    });
});

// Login
app.post('/login', loginLimiter, (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next({ status: 400, message: "Email and password are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {

        if (err) return next(err);

        if (results.length === 0) {
            return next({ status: 404, message: "User not found" });
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return next({ status: 401, message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });
    });
});

// Get Users
app.get('/users', authenticateToken, (req, res, next) => {

    db.query("SELECT id, name, phone, dob, gender, address FROM users", (err, results) => {

        if (err) return next(err);

        res.status(200).json(results);
    });
});

// Delete User
app.delete('/users/:id', authenticateToken, (req, res, next) => {

    const userId = req.params.id;

    db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {

        if (err) return next(err);

        if (result.affectedRows === 0) {
            return next({ status: 404, message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    });
});

// Google Login
app.get('/auth/google', loginLimiter,
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Callback
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    }
);

// Logout
app.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

// ===== 404 Handler =====
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

// ===== Start Server =====
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});