import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import ProgressBar from '../components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useFlowContext } from '../contexts/FlowContext';

export default function UploadPdfScreen() {
  const router = useRouter();
  const { data, setData } = useFlowContext(); // Usando o contexto
  const [file, setFile] = useState<{ name: string; uri: string } | null>(
    data.pdfUri && data.pdfName
      ? { name: data.pdfName, uri: data.pdfUri }
      : null
  );

  // Pega os documentos necessários do serviço
  const documents = data.service
    ? getDocumentsForService(data.service)
    : [];

    const pickDocument = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
        });
    
        // Verifica se o usuário cancelou a operação
        if (result.canceled) {
          Alert.alert('Operação cancelada', 'Nenhum arquivo selecionado.');
          return;
        }
    
        // Garante que o resultado tenha a estrutura correta
        if (result.assets && result.assets.length > 0) {
          const selectedFile = result.assets[0]; // Pega o primeiro arquivo
    
          setFile({ name: selectedFile.name, uri: selectedFile.uri }); // Define o arquivo selecionado
          setData({
            ...data, // Preserva os dados existentes no contexto
            pdfUri: selectedFile.uri,
            pdfName: selectedFile.name,
          });
        } else {
          Alert.alert('Erro', 'Nenhum arquivo válido foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao selecionar o arquivo:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao selecionar o arquivo.');
      }
    };
    

    
    

  const handleNext = () => {
    if (!file) {
      Alert.alert('Erro', 'Por favor, selecione um arquivo primeiro.');
      return;
    }

    router.push('/paymentForm'); // Avança para o formulário de pagamento
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar etapaAtual={3} totalEtapas={4} />
      </View>

      <View style={styles.documentSection}>
        <Text style={styles.documentTitle}>Documentos Necessários:</Text>
        {documents.map((doc, index) => (
          <Text key={index} style={styles.documentItem}>
            • {doc}
          </Text>
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Envie seu arquivo PDF</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
          <Ionicons name="cloud-upload-outline" size={40} color="#888" />
          <Text style={styles.uploadText}>Toque para selecionar um PDF</Text>
          {file && (
            <Text style={styles.fileText}>Arquivo selecionado: {file.name}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Função para obter documentos necessários com base no serviço
const getDocumentsForService = (service: string): string[] => {
  const serviceDetails: Record<string, string[]> = {
    'Primeiro Emplacamento': [
      'Nota fiscal da compra',
      'Cópia da CNH ou identidade',
      'CPF do nome do remetente',
    ],
    'Placa Mercosul': [
      'CRLV do veículo',
      'Cópia da CNH ou identidade',
      'CPF do proprietário do veículo',
      'Recibo de compra e venda (caso a placa seja de modelo antigo)',
      'B.O de perda da placa (caso tenha sido extraviada)',
    ],
    'Segunda Via': [
      'Requisição de segunda via assinada e reconhecida',
      'Cópia da CNH ou identidade',
      'CPF do proprietário do veículo',
      'B.O de perda do CRV',
    ],
    'Transferência Veicular': [
      'ATPV-e ou Recibo de compra e venda assinado e reconhecido',
      'Cópia da CNH ou identidade',
      'CPF do comprador do veículo',
    ],
  };

  return serviceDetails[service] || [];
};

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
  documentSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111c55',
    marginBottom: 10,
  },
  documentItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111c55',
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
