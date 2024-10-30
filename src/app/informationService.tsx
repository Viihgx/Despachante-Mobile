import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function InformationService() {
  const router = useRouter();
  const { service, token } = useLocalSearchParams();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [placaCarro, setPlacaCarro] = useState('');
  const [nomeVeiculo, setNomeVeiculo] = useState('');

  const formatPlaca = (value: string) => {
    value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // Remove caracteres não alfanuméricos e transforma em maiúsculas
    if (value.length > 7) value = value.slice(0, 7); // Limita a 7 caracteres

    // Aplica a formatação conforme o padrão Mercosul (AAA0A00)
    if (value.length > 3 && value.length <= 4) {
      value = value.replace(/([A-Z]{3})(\d{1})/, '$1$2');
    } else if (value.length > 4) {
      value = value.replace(/([A-Z]{3})(\d{1})([A-Z]{1})(\d{1,2})/, '$1$2$3$4');
    }
    setPlacaCarro(value);
  };

  const handleSubmit = () => {
    if (!nomeCompleto || !placaCarro || !nomeVeiculo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    
    router.push({
      pathname: '/uploadPdf',
      params: { service, nomeCompleto, placaCarro, nomeVeiculo, token },
    });
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
        onChangeText={formatPlaca}
        maxLength={7} // Limita a 7 caracteres (padrão AAA0A00)
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
