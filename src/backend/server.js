const express = require('express');
const cors = require('cors'); // Importa o pacote cors
const app = express();
app.options('*', cors());

// Habilita o CORS para permitir requisições de outras origens
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Outras configurações do Express
app.use(express.json());

// Importa suas rotas e configura o servidor
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
