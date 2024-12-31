const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const flash = require('connect-flash'); // Import connect-flash

const PORT = 3000;
// MongoDB URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/keyin_test';

const app = express();
expressWs(app);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'voting-app-secret', // Replace with environment variable for better security
    resave: false,
    saveUninitialized: false,
}));

// Flash message middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// Connected WebSocket clients
let connectedClients = [];

// WebSocket setup
app.ws('/ws', (socket, request) => {
    connectedClients.push(socket);

    socket.on('message', async (message) => {
        const data = JSON.parse(message);
        console.log('Received message:', data);
    });

    socket.on('close', async () => {
        connectedClients = connectedClients.filter((client) => client !== socket);
    });
});

// MongoDB User Schema and Model
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}));

// Poll Schema and Model
const Poll = mongoose.model('Poll', new mongoose.Schema({
    question: String,
    options: [
        {
            answer: String,
            votes: Number,
        },
    ],
}));

// Routes

// Unauthenticated landing page
app.get('/', async (req, res) => {
    if (req.session.user?.id) {
        return res.redirect('/dashboard');
    }
    res.render('index/unauthenticatedIndex', {});
});

// Login routes
app.get('/login', async (req, res) => {
    res.render('index/login', { errorMessage: null, successMessage: res.locals.successMessage });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('index/login', { errorMessage: 'Invalid username or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render('index/login', { errorMessage: 'Invalid username or password.' });
        }

        req.session.user = { id: user._id, username: user.username };

        // Set success message
        req.flash('success', 'Login Successful!');
        return res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        return res.render('index/login', { errorMessage: 'An error occurred. Please try again.' });
    }
});

// Signup routes
app.get('/signup', async (req, res) => {
    res.render('signup', { errorMessage: null });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (password.length < 6) {
            return res.render('signup', { errorMessage: 'Password must be at least 6 characters long.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Set success message for login page
        req.flash('success', 'Registration Successful! Please log in.');
        return res.redirect('/login');
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.render('signup', { errorMessage: 'Username is already taken. Please choose another.' });
        }
        return res.render('signup', { errorMessage: 'An error occurred. Please try again.' });
    }
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
    if (!req.session.user?.id) {
        return res.redirect('/');
    }
    const polls = await Poll.find({});
    return res.render('index/authenticatedIndex', { polls, successMessage: res.locals.successMessage });
});

// Create Poll Page (GET Route)
app.get('/createPoll', async (req, res) => {
    if (!req.session.user?.id) {
        return res.redirect('/');
    }
    return res.render('createPoll', { errorMessage: null });
});

// Poll Creation (POST Route)
app.post('/createPoll', async (req, res) => {
    const { question, options } = req.body;

    // Basic validation
    if (!question || question.trim().length < 5) {
        return res.render('createPoll', { errorMessage: 'Poll question must be at least 5 characters long.' });
    }

    const formattedOptions = Object.values(options || {}).filter(option => option.trim() !== '');
    if (formattedOptions.length < 2) {
        return res.render('createPoll', { errorMessage: 'Please provide at least 2 options for the poll.' });
    }

    // Ensure options are unique
    const uniqueOptions = [...new Set(formattedOptions)];
    if (uniqueOptions.length !== formattedOptions.length) {
        return res.render('createPoll', { errorMessage: 'Poll options must be unique.' });
    }

    try {
        const newPoll = new Poll({ question, options: uniqueOptions.map(option => ({ answer: option, votes: 0 })) });
        await newPoll.save();

        // Notify WebSocket clients
        connectedClients.forEach(client => {
            client.send(JSON.stringify({ type: 'new_poll', poll: newPoll }));
        });

        return res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        return res.render('createPoll', { errorMessage: 'Failed to create poll. Please try again.' });
    }
});

// MongoDB connection
mongoose.connect(MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((err) => console.error('MongoDB connection error:', err));
