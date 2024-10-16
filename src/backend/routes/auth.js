const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'wS&erhPk#65m]jDC7N/Qa<';  // chave secreta segura

// Rota de Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase
    .from('Usuarios')
    .select('Nome, Email_usuario, Senha_usuario')
    .eq('Email_usuario', email)
    .single();

  if (error) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  if (data.Senha_usuario !== senha) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  // Gerando o token JWT
  const token = jwt.sign({ email: data.Email_usuario, nome: data.Nome }, SECRET_KEY, {
    expiresIn: '1h'  // Token expira em 1 hora
  });

  res.status(200).json({ message: 'Login bem-sucedido', token });
});

// Rota de Cadastro (SignUp)
router.post('/signup', async (req, res) => {
  const { email, senha, nome } = req.body;
  console.log('Tentativa de criação de conta para o email:', email);

  const { data, error } = await supabase
    .from('Usuarios')
    .select('Email_usuario')
    .eq('Email_usuario', email)
    .maybeSingle();

  if (error) {
    console.error('Erro ao verificar se o email já existe:', error);
    return res.status(400).json({ error: 'Erro ao verificar o email' });
  }

  if (data) {
    console.log('Email já cadastrado:', email);
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const { error: insertError } = await supabase
    .from('Usuarios')
    .insert([{ Nome: nome, Email_usuario: email, Senha_usuario: senha }]);

  if (insertError) {
    console.error('Erro ao criar usuário:', insertError);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }

  console.log('Usuário criado com sucesso:', email);
  res.status(200).json({ message: 'Usuário criado com sucesso' });
});

// Middleware de Autenticação para Proteger Rotas
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });

    req.user = user;  // Armazena as informações do usuário no request
    next();  // Passa para o próximo middleware ou rota
  });
}

// Teste de Rota Protegida
router.get('/protected-route', authenticateToken, (req, res) => {
  res.json({ message: `Olá, ${req.user.nome}. Você tem acesso a esta rota protegida!` });
});

// Rota para Buscar Dados do Usuário Logado
router.get('/user-data', authenticateToken, async (req, res) => {
  const { email } = req.user;

  const { data, error } = await supabase
    .from('Usuarios')
    .select('Nome')
    .eq('Email_usuario', email)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }

  res.status(200).json({ name: data.Nome });
});

// Rota para buscar os serviços solicitados pelo usuário logado
router.get('/meus-servicos', authenticateToken, async (req, res) => {
  const { email } = req.user;

  try {
    // Buscar o usuário pelo email
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('Usuarios')
      .select('ID')
      .eq('Email_usuario', email)
      .single();

    if (usuarioError || !usuarioData) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar os serviços solicitados pelo usuário
    const { data: servicosData, error: servicosError } = await supabase
      .from('servicoSolicitado')
      .select('tipo_servico, forma_pagamento, status_servico, data_solicitacao, file_pdfs')
      .eq('id_usuario', usuarioData.ID);

    if (servicosError) {
      return res.status(500).json({ error: 'Erro ao buscar serviços' });
    }

    res.status(200).json({ servicos: servicosData });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});
// Rota para buscar os dados do usuário
app.get('/api/user-data-usuario', authenticateToken, async (req, res) => {
  const { email } = req.user;

  const { data, error } = await supabase
    .from('Usuarios')
    .select('Nome, Email_usuario, Numero_celular')
    .eq('Email_usuario', email)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }

  res.status(200).json({ name: data.Nome, email: data.Email_usuario, phone: data.Numero_celular });
});

// Rota para buscar veículos do usuário
app.get('/api/veiculos', authenticateToken, async (req, res) => {
  const { email } = req.user;

  const { data: usuarioData, error: usuarioError } = await supabase
    .from('Usuarios')
    .select('ID')
    .eq('Email_usuario', email)
    .single();

  if (usuarioError || !usuarioData) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const { data: veiculosData, error: veiculosError } = await supabase
    .from('Veiculos')
    .select('id, placa_veiculo, nome_veiculo')
    .eq('usuario_id', usuarioData.ID);

  if (veiculosError) {
    return res.status(500).json({ error: 'Erro ao buscar veículos' });
  }

  res.status(200).json({ vehicles: veiculosData });
});

// Rota para adicionar veículo
app.post('/api/add-veiculo', authenticateToken, async (req, res) => {
  const { placa, nome } = req.body;
  const { email } = req.user;

  const { data: usuarioData, error: usuarioError } = await supabase
    .from('Usuarios')
    .select('ID')
    .eq('Email_usuario', email)
    .single();

  if (usuarioError || !usuarioData) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const { error: insertError } = await supabase
    .from('Veiculos')
    .insert([{ usuario_id: usuarioData.ID, placa_veiculo: placa, nome_veiculo: nome }]);

  if (insertError) {
    return res.status(500).json({ error: 'Erro ao adicionar veículo' });
  }

  res.status(200).json({ message: 'Veículo adicionado com sucesso' });
});

// Rota para excluir veículo
router.delete('/api/delete-veiculo/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('Veiculos')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Erro ao excluir veículo' });
    }

    res.status(200).json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    res.status(500).json({ error: 'Erro ao excluir veículo' });
  }
});

// Rota para editar os dados do usuário
app.put('/api/update-user', authenticateToken, async (req, res) => {
  const { name, email, phone } = req.body;
  const { email: currentEmail } = req.user;

  const { error } = await supabase
    .from('Usuarios')
    .update({ Nome: name, Email_usuario: email, Numero_celular: phone })
    .eq('Email_usuario', currentEmail);

  if (error) {
    return res.status(500).json({ error: 'Erro ao atualizar dados do usuário' });
  }

  res.status(200).json({ message: 'Dados atualizados com sucesso' });
});

module.exports = router;
module.exports = router;


