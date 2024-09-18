import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Corrigido o import

export default function InformationService() {
  const router = useRouter();
  const { service } = useLocalSearchParams(); // Corrigido para useLocalSearchParams
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [placaCarro, setPlacaCarro] = useState('');
  const [nomeVeiculo, setNomeVeiculo] = useState('');

  const handleSubmit = () => {
    if (!nomeCompleto || !placaCarro || !nomeVeiculo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    Alert.alert('Sucesso', 'Serviço solicitado com sucesso!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviço Selecionado: {service}</Text>
      <Text style={styles.title}>Preencha as informações abaixo:</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
      />

      <TextInput
        style={styles.input}
        placeholder="Placa do Carro"
        value={placaCarro}
        onChangeText={setPlacaCarro}
      />

      <TextInput
        style={styles.input}
        placeholder="Nome do Veículo"
        value={nomeVeiculo}
        onChangeText={setNomeVeiculo}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Avançar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
