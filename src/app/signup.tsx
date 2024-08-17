import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
      />
      <Button title="Cadastrar" onPress={() => {}} color="#007bff" />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem uma conta?</Text>
        <Link href="/login" style={styles.link}>Fazer Login</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
  },
});
