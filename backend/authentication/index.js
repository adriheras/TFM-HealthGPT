const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

// Conectar a MongoDB Atlas (reemplaza la URL con tu conexión de MongoDB Atlas)
mongoose.connect(MONGO_URI);
const db = mongoose.connection;

// Definir el modelo de usuario
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Endpoint para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  console.log('POST /register called');
  try {
    const { username, password } = req.body;
    console.log(`Received data: ${JSON.stringify(req.body)}`);

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists');
      return res.status(409).json({ error: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    console.log('Saving new user to the database...');
    await newUser.save();
    console.log('User saved successfully');
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error('Error while registering the user:', error);
    res.status(500).json({ error: error.message });
  }
});


// Endpoint para iniciar sesión
app.post('/login', async (req, res) => {
  console.log('POST /login called');
  try {
    const { username, password } = req.body;
    console.log(`Received data: ${JSON.stringify(req.body)}`);

    const user = await User.findOne({ username });
    if (!user) {
      console.log('Invalid username or password');
      return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Invalid username or password');
      return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log('User logged in successfully');
    res.json({ token });
  } catch (error) {
    console.error('Error while logging in the user:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// Endpoint para validar el token
app.post('/validate-token', (req, res) => {
  console.log('POST /validate-token called');
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

    console.log('Token validated successfully');
    res.json({ isValid: true });
  });
});

// Endpoint para cambiar la contraseña (se requiere autenticación)
app.post('/change-password', authenticateToken, async (req, res) => {
  console.log('POST /change-password called');
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;
    console.log(`Received data: ${JSON.stringify(req.body)}`);

    if (!userId) {
      console.log('User not authenticated');
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log('Old password does not match');
      return res.status(400).json({ error: 'La contraseña actual no coincide.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Updating user password...');
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    console.log('Password updated successfully');
    res.json({ message: 'Contraseña cambiada con éxito.' });
  } catch (error) {
    console.error('Error while changing the password:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
