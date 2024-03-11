const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET;
const OPENAI_API = process.env.OPENAI_API;
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

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

const openai = new OpenAI({ apiKey: OPENAI_API });

app.post('/chat', authenticateToken, async (req, res) => {
  const prompt = req.body.prompt;
  const conversation = req.body.conversation; // Obtén la conversación desde la solicitud

  const messages = [
    {
      role: "system",
      content: "Eres un útil asistente de salud. Responderás preguntas sobre salud, ejercicio y nutrición."
    },
    ...conversation, // Incluye todos los mensajes anteriores en la solicitud
    {
      role: "user",
      content: prompt
    }
  ];

  console.log(`Received chat request from user ${req.userId} with prompt: ${prompt}`);

  const response = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-3.5-turbo",
  });

  console.log(`OpenAI response: ${response.choices[0].message.content}`);

  res.json(response.choices[0].message.content);
});


app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});