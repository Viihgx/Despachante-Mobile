import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';

export default function SignUpScreen() {
  const [nome, setNome] = useState('');  // Novo estado para o nome
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const API_URL = 'http://10.0.2.2:5000';
  const router = useRouter();

  const handleSignUp = async () => {
    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'As senhas não correspondem');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/signup`, { nome, email, senha });
      if (response.data.message === 'Usuário criado com sucesso') {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        router.push('/login'); // Redireciona para a tela de login após o cadastro
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Erro no cadastro', error.response?.data?.error || error.message || 'Erro desconhecido');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmSenha}
        onChangeText={setConfirmSenha}
        secureTextEntry
      />
      <Button title="Criar Conta" onPress={handleSignUp} />

      <View style={styles.loginContainer}>
      <Text style={styles.loginText}>Já tem conta?</Text>
        <Link href="/login" style={styles.loginLink}>
          Faça Login
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  loginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 5,
    color: '#007bff',
    fontSize: 16,
  },
});
