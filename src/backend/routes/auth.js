const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase
    .from('Usuarios')
    .select('Email_usuario, Senha_usuario')
    .eq('Email_usuario', email)
    .single();

  if (error) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  if (data.Senha_usuario !== senha) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  res.status(200).json({ message: 'Login bem-sucedido', user: data });
});

// Singnup
router.post('/signup', async (req, res) => {
  const { email, senha, nome } = req.body;  // Agora recebemos o nome no corpo da requisição
  console.log('Tentativa de criação de conta para o email:', email);

  // Verifica se o email já existe
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

  // Insere o novo usuário com o nome
  const { error: insertError } = await supabase
    .from('Usuarios')
    .insert([{ Nome: nome, Email_usuario: email, Senha_usuario: senha }]);  // Incluindo o nome na inserção

  if (insertError) {
    console.error('Erro ao criar usuário:', insertError);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }

  console.log('Usuário criado com sucesso:', email);
  res.status(200).json({ message: 'Usuário criado com sucesso' });
});



module.exports = router;
