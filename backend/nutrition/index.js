const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const axios = require('axios'); // Import axios
// Middleware para verificar el token de autenticación

const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const USDA_API_KEY = process.env.USDA_API_KEY;
const UNSPLASH_CLIENT_ID = process.env.UNSPLASH_CLIENT_ID;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI);

const foodSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  calorias: {
    type: Number,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  imagenUrl: {
    type: String,
    default: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png',
  },
});

const Food = mongoose.model('Plato', foodSchema);

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


app.get('/foods', async (req, res) => {
  const username = req.userId; // Obtiene el userId del middleware de autenticación
  console.log(`GET /foods called for user ${username}`);
  const foods = await Food.find({ username: username }); // Busca solo los alimentos del usuario autenticado
  console.log(`Fetched ${foods.length} foods for user ${username}`);
  res.send(foods);
});

async function translateFoodName(foodName) {
  console.log(`Translating food name: ${foodName}`);
  const response = await axios.get(`https://api.mymemory.translated.net/get?q=${foodName}&langpair=es|en`);
  const translations = response.data.responseData.translatedText.split(',');
  console.log(`Translation result: ${translations[0].trim()}`);
  return translations[0].trim(); // return only the first translation
}

app.post('/foods', async (req, res) => {
  const username = req.userId; // Obtiene el userId del middleware de autenticación
  const foodName = req.body.nombre;
  console.log(`POST /foods called with food name: ${foodName}`);
  const translatedFoodName = await translateFoodName(foodName);
  const foodQuantity = req.body.cantidad;
  const foodInfo = await getFoodInfo(translatedFoodName);
  const caloriesForQuantity = (foodInfo.calories * foodQuantity) / 100; // calculate calories for the quantity
  const food = new Food({
    username: username, // Añade el username al nuevo alimento
    nombre: foodName,
    calorias: caloriesForQuantity, // use the calculated calories
    cantidad: foodQuantity,
    imagenUrl: foodInfo.imageUrl,
  });
  console.log('Saving new food to the database...');
  await food.save();
  console.log('Food saved successfully');
  res.send(food);
});

async function getFoodInfo(foodName) {
  console.log(`Fetching food info for: ${foodName}`);
  const calories = await getCalories(foodName);
  const imageUrl = await getImageUrl(foodName);
  return { calories, imageUrl };
}

async function getCalories(foodName) {
  console.log(`Fetching calories for: ${foodName}`);
  const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodName}&api_key=${USDA_API_KEY}`);
  if (response.data.foods && response.data.foods.length > 0) {
    const food = response.data.foods[0];
    const nutrient = food.foodNutrients.find(nutrient => nutrient.nutrientName === 'Energy');
    return nutrient ? nutrient.value : 0;
  } else {
    return 0;
  }
}

async function getImageUrl(foodName) {
  console.log(`Fetching image URL for: ${foodName}`);
  const response = await axios.get(`https://api.unsplash.com/search/photos?query=${foodName}&client_id=${UNSPLASH_CLIENT_ID}`);
  if (response.data.results.length > 0) {
    return response.data.results[0].urls.small;
  } else {
    return 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
