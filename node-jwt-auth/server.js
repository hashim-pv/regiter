const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' })); 

const PORT = process.env.PORT || 5000;
const SECRET_KEY = "hashim"; 

const MONGO_URI = "mongodb+srv://hashimpvappu3:hashim@cluster0.v6tjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch(err => {
    console.error("Error connecting to MongoDB Atlas:", err);
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true } 
});

const User = mongoose.model('User', userSchema);

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided." });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Invalid token format." });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log("Token verification error:", err); 
            return res.status(403).json({ message: `${err.message}` });
        }

        req.userId = decoded.id;
        next();
    });
};

app.post('/signup', async (req, res) => {
    const { name, lastName, email, password, phoneNumber } = req.body;

    if (!name || !lastName || !email || !password || !phoneNumber) { 
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber 
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error("Error during user registration:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.get('/users', verifyToken, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.get('/users/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
