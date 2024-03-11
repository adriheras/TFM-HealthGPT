const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

// Conectar a MongoDB Atlas (reemplaza la URL con tu conexión de MongoDB Atlas)
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
const healthSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  bloodPressure: {
    systolic: {
      type: Number,
      required: function () {
        // La diastólica es requerida solo si la sistólica está presente
        return this.bloodPressure && this.bloodPressure.systolic !== null;
      },
    },
    diastolic: {
      type: Number,
      required: function () {
        // La diastólica es requerida solo si la sistólica está presente
        return this.bloodPressure && this.bloodPressure.systolic !== null;
      },
    },
  },
  heartRate: {
    type: Number,
  },
  bloodGlucose: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

const Health = mongoose.model('Health', healthSchema);

// Middleware to verify the authentication token
const authenticateToken = (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) {
    console.log('Unauthorized access attempt detected');
    return res.status(401).json({ message: 'Acceso no autorizado.' });
  }

  // Si el token viene con el prefijo 'Bearer', lo removemos
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (req.headers['x-forwarded-authorization']) {
    const jwtPayload = req.headers['x-forwarded-authorization']
    token = jwtPayload;
  } else {
    console.log('x-forwarded-authorization header not found');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Invalid token detected');
      return res.status(403).json({ message: 'Token inválido.' });
    }
    req.userId = user.userId;
    next();
  });
};

app.use(authenticateToken); // Apply the middleware to all following routes

// GET method
app.get('/health', async (req, res) => {
  try {
    const healthData = await Health.find({ username: req.userId }); // Filter by username
    console.log(`Fetched health data for user ${req.userId}`);
    res.status(200).json(healthData);
  } catch (err) {
    console.error(`Error fetching health data: ${err}`);
    res.status(500).send(err);
  }
});

// POST method
app.post('/health', async (req, res) => {
  const newHealthData = new Health({
    ...req.body,
    username: req.userId, // Add username to the request body
  });

  try {
    const savedHealthData = await newHealthData.save();
    console.log(`Saved health data for user ${req.userId}`);
    res.status(201).json(savedHealthData);
  } catch (err) {
    console.error(`Error saving health data: ${err}`);
    res.status(500).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});