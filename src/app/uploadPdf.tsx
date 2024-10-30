import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function UploadPdfScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const router = useRouter();
  const { service, token, nomeCompleto, placaCarro, nomeVeiculo } = useLocalSearchParams();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) {
        Alert.alert('Operação cancelada', 'Nenhum arquivo selecionado.');
        return;
      }

      console.log('Documento selecionado:', result);
      setFile(result);
    } catch (error) {
      console.log('Erro ao selecionar o arquivo:', error);
    }
  };

  const goToPayment = () => {
    if (!file || file.canceled) {
      Alert.alert('Erro', 'Por favor, selecione um arquivo primeiro.');
      return;
    }

    router.push({
      pathname: '/paymentForm',
      params: { token, nomeCompleto, placaCarro, nomeVeiculo, pdfUri: file.assets[0].uri, pdfName: file.assets[0].name, service },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Envie seu arquivo PDF</Text>

      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>Selecionar PDF</Text>
      </TouchableOpacity>

      {file && !file.canceled && (
        <Text style={styles.fileText}>Arquivo selecionado: {file.assets[0].name}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={goToPayment}>
        <Text style={styles.buttonText}>Avançar</Text>
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
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  fileText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
