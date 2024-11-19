import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProgressBar from '../components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

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
       <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <ProgressBar etapaAtual={3} totalEtapas={4} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Envie seu arquivo PDF</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
          <Ionicons name="cloud-upload-outline" size={40} color="#888" />
          <Text style={styles.uploadText}>Toque para selecionar um PDF</Text>
          {file && !file.canceled && (
            <Text style={styles.fileText}>Arquivo selecionado: {file.assets[0].name}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={goToPayment}>
          <Text style={styles.nextButtonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  progressBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  fileText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#f5b91e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: '#111c55',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#111c55',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
