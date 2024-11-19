import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProgressBar from '../components/ProgressBar';

export default function PaymentForm() {
  const router = useRouter();
  const { token, pdfUri, pdfName, service, nomeCompleto, placaCarro, nomeVeiculo } = useLocalSearchParams();

  const [cpf, setCpf] = useState<string>('');
  const [metodoPagamento, setMetodoPagamento] = useState<string>('');
  const API_URL = 'http://10.0.2.2:5000/api';

  const tipoServico = Array.isArray(service) ? service[0] : service || '';
  const nome = Array.isArray(nomeCompleto) ? nomeCompleto[0] : nomeCompleto || '';
  const placa = Array.isArray(placaCarro) ? placaCarro[0] : placaCarro || '';
  const veiculo = Array.isArray(nomeVeiculo) ? nomeVeiculo[0] : nomeVeiculo || '';

  const formatCpf = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(value);
  };

  const handlePaymentSubmit = async () => {
    // Verificação dos parâmetros obrigatórios
  if (!cpf || !metodoPagamento || !tipoServico) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
    return;
  }

  if (!token) {
    Alert.alert('Erro', 'Token de autenticação não encontrado');
    return;
  }

  if (!pdfUri || !pdfName) {
    Alert.alert('Erro', 'Arquivo PDF não encontrado. Por favor, faça o upload de um PDF válido.');
    return;
  }

  if (!nomeCompleto || !placaCarro || !nomeVeiculo) {
    Alert.alert('Erro', 'Informações do veículo estão incompletas. Por favor, preencha todos os dados.');
    return;
  }

    const formData = new FormData();
    if (typeof pdfUri === 'string' && typeof pdfName === 'string') {
      formData.append('pdfFiles', {
        uri: pdfUri,
        name: pdfName || 'arquivo.pdf',
        type: 'application/pdf',
      } as any);        
    } else {
      Alert.alert('Erro', 'Arquivo PDF não encontrado');
      return;
    }

    formData.append('tipoServico', tipoServico);
    formData.append('nomeCompleto', nome);
    formData.append('formaPagamento', metodoPagamento);
    formData.append('placaVeiculo', placa);
    formData.append('nomeVeiculo', veiculo);

    try {
      const response = await axios.post(`${API_URL}/upload-pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 60000,
      });

      Alert.alert('Sucesso', 'Serviço solicitado com sucesso.');
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer upload de PDFs:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar o serviço.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <ProgressBar etapaAtual={3} totalEtapas={4} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Informações de Pagamento</Text>
        <View style={styles.inputContainer}>
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={formatCpf}
          keyboardType="numeric"
          maxLength={14}
        />
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Selecione um método de pagamento:</Text>
          <Picker
            selectedValue={metodoPagamento}
            style={styles.picker}
            onValueChange={(itemValue) => setMetodoPagamento(itemValue)}
          >
            <Picker.Item label="Escolha um método" value="" />
            <Picker.Item label="Boleto" value="boleto" />
            <Picker.Item label="Cartão de Débito" value="debito" />
            <Picker.Item label="Cartão de Crédito" value="credito" />
            <Picker.Item label="Pix" value="pix" />
          </Picker>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handlePaymentSubmit}>
          <Text style={styles.submitButtonText}>Finalizar</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111c55',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
    height: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderColor: '#cccccc',
    borderWidth: 1,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
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
  submitButton: {
    backgroundColor: '#111c55',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
