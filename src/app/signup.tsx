import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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
        placeholderTextColor="#999"
        value={nome}
        onChangeText={setNome}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        placeholderTextColor="#999"
        value={confirmSenha}
        onChangeText={setConfirmSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.signupButtonText}>Criar Conta</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Já tem uma conta?</Text>
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111c55',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#111',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButton: {
    backgroundColor: '#111c55',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    marginLeft: 5,
    color: '#f5b91e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});