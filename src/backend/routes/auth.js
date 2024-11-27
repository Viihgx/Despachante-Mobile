const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Substituir por outro provedor se necessário
  auth: {
    user: 'eduardo.mbas@gmail.com',
    pass: 'uuzo wuse hxzy gpam', // Use uma senha ou app password
  },
});

// Armazenamento temporário de PINs com timestamps
const pinStorage = {}; // { email: { pin: '123456', expiresAt: 1690000000 } }

// Função para gerar PIN
const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString(); // Gera PIN de 6 dígitos

// Enviar PIN com expiração
router.post('/send-pin', async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar se o e-mail está cadastrado
    const { data, error } = await supabase
      .from('Usuarios')
      .select('Email_usuario')
      .eq('Email_usuario', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'E-mail não encontrado.' });
    }

    // Gerar e armazenar o PIN com tempo de expiração
    const pin = generatePin();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos a partir de agora
    pinStorage[email] = { pin, expiresAt };

    // Enviar o PIN por e-mail
    await transporter.sendMail({
      from: '"Sua Empresa" <eduardo.mbas@gmail.com>',
      to: email,
      subject: 'Recuperação de Senha',
      text: `Seu PIN de recuperação de senha é: ${pin}. Ele expira em 10 minutos.`,
    });

    res.status(200).json({ success: true, message: 'PIN enviado para o e-mail.' });
  } catch (err) {
    console.error('Erro ao enviar PIN:', err);
    res.status(500).json({ success: false, message: 'Erro ao enviar PIN.' });
  }
});

// Validar PIN
router.post('/validate-pin', (req, res) => {
  const { email, pin } = req.body;

  if (!pinStorage[email]) {
    return res.status(400).json({ success: false, message: 'PIN não encontrado ou expirado.' });
  }

  const { pin: storedPin, expiresAt } = pinStorage[email];

  // Verificar se o PIN está expirado
  if (Date.now() > expiresAt) {
    delete pinStorage[email];
    return res.status(400).json({ success: false, message: 'PIN expirado.' });
  }

  // Validar o PIN
  if (storedPin === pin) {
    return res.status(200).json({ success: true, message: 'PIN validado com sucesso.' });
  }

  res.status(400).json({ success: false, message: 'PIN inválido.' });
});

// Redefinir Senha
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Verificar se o e-mail está cadastrado
    const { data, error } = await supabase
      .from('Usuarios')
      .select('Email_usuario')
      .eq('Email_usuario', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'E-mail não encontrado.' });
    }

    // Verificar se o PIN existe e está válido
    if (!pinStorage[email] || Date.now() > pinStorage[email].expiresAt) {
      delete pinStorage[email];
      return res.status(400).json({ success: false, message: 'PIN expirado ou inválido.' });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar a senha no banco de dados
    const { error: updateError } = await supabase
      .from('Usuarios')
      .update({ Senha_usuario: hashedPassword })
      .eq('Email_usuario', email);

    if (updateError) {
      throw updateError;
    }

    // Remover o PIN após redefinição de senha
    delete pinStorage[email];

    res.status(200).json({ success: true, message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ success: false, message: 'Erro ao redefinir senha.' });
  }
});

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();  // Armazena os arquivos na memória em vez de no disco
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);  // Aceitar apenas PDFs
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'), false);
    }
  },
});

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

  // Comparar a senha fornecida com o hash armazenado
  const senhaValida = await bcrypt.compare(senha, data.Senha_usuario);
  if (!senhaValida) {
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

   // Hash da senha
   const saltRounds = 10; // Número de rounds de salt
   const hashedPassword = await bcrypt.hash(senha, saltRounds);

  const { error: insertError } = await supabase
    .from('Usuarios')
    .insert([{ Nome: nome, Email_usuario: email, Senha_usuario: hashedPassword }]);

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

  console.log('Token recebido:', token); 
  
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
        .select('id, tipo_servico, forma_pagamento, status_servico, data_solicitacao, file_pdfs, nome_completo, placa_do_veiculo') // Adicionando os campos nome_completo e placa_do_veiculo
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
router.get('/api/user-data-usuario', authenticateToken, async (req, res) => {
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
router.get('/api/veiculos', authenticateToken, async (req, res) => {
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
router.post('/api/add-veiculo', authenticateToken, async (req, res) => {
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
router.put('/api/update-user', authenticateToken, async (req, res) => {
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

//ENVIAR PDF 0.1
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

// Rota de teste de autenticação
router.post('/test-auth', authenticateToken, (req, res) => {
  return res.status(200).json({ message: `Autenticação bem-sucedida para ${req.user.email}` });
});

// Rota para Upload de PDFs e vinculação ao serviço
router.post('/upload-pdfs', authenticateToken, upload.array('pdfFiles', 10), async (req, res) => {
  console.log('Usuário autenticado:', req.user);
  console.log('Arquivos recebidos:', req.files);

  const { email } = req.user;
  const { tipoServico, nomeCompleto, placaVeiculo, nomeVeiculo, formaPagamento } = req.body; // Adicionando formaPagamento
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  if (!tipoServico || !nomeCompleto || !placaVeiculo || !nomeVeiculo || !formaPagamento) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    // Buscar o ID do usuário pelo email
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('Usuarios')
      .select('ID')
      .eq('Email_usuario', email)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('Erro ao buscar usuário:', usuarioError);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const idUsuario = usuarioData.ID;
    const pdfLinks = [];
    const uploadErrors = [];

    // Iterar sobre os arquivos e fazer upload para o Supabase Storage
    for (const file of files) {
      console.log(`Processando arquivo: ${file.originalname}`);

      const fileContent = file.buffer;
      // Gera um nome de arquivo único usando `idUsuario`, `placaVeiculo`, timestamp e o nome original do arquivo
      const uniqueFileName = `${idUsuario}_${placaVeiculo}_${Date.now()}_${file.originalname}`;

      try {
        const { data, error } = await supabase.storage
          .from('arquivoPdf')
          .upload(`uploads/${uniqueFileName}`, fileContent, {
            contentType: 'application/pdf',
          });

        if (error) throw error;

        const publicUrl = supabase.storage.from('arquivoPdf').getPublicUrl(`uploads/${uniqueFileName}`).data.publicUrl;
        pdfLinks.push(publicUrl); // Armazena o link do PDF
        console.log(`Upload bem-sucedido: ${uniqueFileName}`);

      } catch (uploadError) {
        console.error(`Erro ao fazer upload do arquivo: ${uniqueFileName}`, uploadError);
        uploadErrors.push(uniqueFileName);
      }
    }

    if (pdfLinks.length === 0) {
      return res.status(500).json({ error: 'Falha ao fazer upload de todos os arquivos' });
    }

    // Inserir ou atualizar o registro do serviço solicitado com todas as informações e links de PDF
    const { data: updateData, error: updateError } = await supabase
      .from('servicoSolicitado')
      .insert({
        id_usuario: idUsuario,
        tipo_servico: tipoServico,
        forma_pagamento: formaPagamento,
        status_servico: 'Pendente',
        data_solicitacao: new Date(),
        file_pdfs: pdfLinks,
        nome_completo: nomeCompleto,
        placa_do_veiculo: placaVeiculo,
        apelido_do_veiculo: nomeVeiculo
      }, { onConflict: ['id_usuario', 'placa_do_veiculo', 'tipo_servico'] });

      if (updateError) {
        console.error('Erro ao inserir/atualizar serviço:', updateError);
        return res.status(500).json({ error: 'Erro ao inserir/atualizar serviço' });
      }

    res.status(200).json({ 
      message: 'PDFs enviados e vinculados com sucesso', 
      pdfLinks,
      uploadErrors: uploadErrors.length ? uploadErrors : null 
    });
    
  } catch (error) {
    console.error('Erro ao fazer upload de PDFs:', error);
    res.status(500).json({ error: 'Erro ao fazer upload de PDFs' });
  }
});

router.put('/replace-pdf', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    console.log('Arquivo recebido:', req.file);
    console.log('Body recebido:', req.body);

    const { servicoId, fileIndex } = req.body;

    // Verifique se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // Verifique se `servicoId` e `fileIndex` estão presentes
    if (!servicoId || fileIndex === undefined) {
      return res.status(400).json({ error: 'Parâmetros inválidos.' });
    }

    // Buscar o serviço pelo ID
    const { data: servico, error: servicoError } = await supabase
      .from('servicoSolicitado')
      .select('file_pdfs')
      .eq('id', servicoId)
      .single();

    if (servicoError || !servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    // Fazer o upload do novo PDF
    const fileName = `${servicoId}_${Date.now()}_${req.file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from('arquivoPdf')
      .upload(`uploads/${fileName}`, req.file.buffer, {
        contentType: 'application/pdf',
      });

    if (uploadError) {
      throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
    }

    const newFileUrl = supabase.storage.from('arquivoPdf').getPublicUrl(`uploads/${fileName}`).data.publicUrl;

    // Atualizar o PDF no array de `file_pdfs`
    const updatedPdfs = [...servico.file_pdfs];
    updatedPdfs[fileIndex] = newFileUrl;

    // Atualizar o registro no banco de dados
    const { error: updateError } = await supabase
      .from('servicoSolicitado')
      .update({ file_pdfs: updatedPdfs })
      .eq('id', servicoId);

    if (updateError) {
      throw new Error(`Erro ao atualizar os dados: ${updateError.message}`);
    }

    res.status(200).json({ message: 'PDF substituído com sucesso.', fileUrl: newFileUrl });
  } catch (error) {
    console.error('Erro ao substituir o PDF:', error.message);
    res.status(500).json({ error: 'Erro ao substituir o PDF.', details: error.message });
  }
});





// Rota para buscar mensagens por ID do serviço
router.get('/messages/:servico_id', authenticateToken, async (req, res) => {
  const { servico_id } = req.params;
  console.log('ID recebido no backend:', servico_id);

  try {
    const { data, error } = await supabase
  .from('messages')
  .select('text, timestamp')
  .eq('servico_id', servico_id);

    console.log('Dados retornados do Supabase:', data); // Log para depuração

    if (error) {
      console.error('Erro ao buscar mensagens no Supabase:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar mensagens' });
    }

    res.status(200).json({ success: true, messages: data });
  } catch (error) {
    console.error('Erro interno ao buscar mensagens:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});




module.exports = router;

