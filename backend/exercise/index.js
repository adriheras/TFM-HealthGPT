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
const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  calories: { // Añade la propiedad calories
    type: Number,
    required: true,
  },
}, {
  timestamps: true,  // Agrega timestamps automáticamente
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Middleware para verificar el token de autenticación
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

app.use(authenticateToken); // Aplica el middleware a todas las rutas siguientes

// Ruta para obtener todos los ejercicios de un mismo username
app.get('/exercises', async (req, res) => {
  const username = req.userId;
  console.log(`GET /exercises called for user ${username}`);
  try {
    const exercises = await Exercise.find({ username });
    console.log(`Fetched ${exercises.length} exercises for user ${username}`);
    res.json(exercises);
  } catch (error) {
    console.error('Error while fetching exercises:', error);
    res.status(500).json({ error: 'Error al obtener los ejercicios' });
  }
});

// Ruta para añadir un nuevo ejercicio a la base de datos
app.post('/exercises', async (req, res) => {
  console.log('POST /exercises called');
  const username = req.userId;
  const { type, duration, intensity, distance, calories } = req.body; // Añade calories

  console.log(`Received data: ${JSON.stringify(req.body)}`);

  try {
    const newExercise = new Exercise({
      username,
      type,
      duration,
      intensity,
      distance,
      calories, // Añade calories
    });

    console.log('Saving new exercise to the database...');
    const savedExercise = await newExercise.save();
    console.log('Exercise saved successfully');
    res.status(201).json(savedExercise);
  } catch (error) {
    console.error('Error while saving the exercise:', error);
    res.status(500).json({ error: 'Error al añadir un nuevo ejercicio' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
