const express = require('express');
const cors = require('cors'); // Importa o pacote cors

const app = express();

// Habilita o CORS para permitir requisições de outras origens
app.use(cors());

// Outras configurações do Express
app.use(express.json());

// Importa suas rotas e configura o servidor
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
