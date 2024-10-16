import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function UploadPdfScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const router = useRouter();
  const { token } = useLocalSearchParams(); 
  const API_URL = 'http://10.0.2.2:5000/api';

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

  const uploadDocument = async () => {
    if (!file || file.canceled) {
      Alert.alert('Erro', 'Por favor, selecione um arquivo primeiro.');
      return;
    }

    if (!token) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      router.push('/login');
      return;
    }

    const { uri, name } = file.assets[0];

    const formData = new FormData();
    formData.append('pdfFiles', {
      uri,  // Use diretamente o URI fornecido pelo DocumentPicker
      name: name || 'arquivo.pdf',
      type: 'application/pdf',
    } as any);

    console.log('FormData preparado:', formData);

    try {
      const response = await axios.post(`${API_URL}/upload-pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 60000,
      });

      Alert.alert('Sucesso', 'PDF enviado com sucesso.');
      console.log('Resposta do servidor:', response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log('Resposta do servidor:', error.response.data);
        } else if (error.request) {
          console.log('Sem resposta do servidor:', error.request);
        } else {
          console.log('Erro ao configurar a requisição:', error.message);
        }
      } else if (error instanceof Error) {
        console.log('Erro:', error.message);
      } else {
        console.log('Erro inesperado:', error);
      }

      Alert.alert('Erro', 'Ocorreu um erro ao enviar o arquivo.');
    }
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

      <TouchableOpacity style={styles.button} onPress={uploadDocument}>
        <Text style={styles.buttonText}>Enviar PDF</Text>
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
