import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ProgressBar from '../components/ProgressBar';
import { useFlowContext } from '../contexts/FlowContext';

export default function PaymentForm() {
  const router = useRouter();
  const { data, setData, clearData } = useFlowContext(); // Usa os dados e as funções do contexto

  // Define os valores iniciais com base no contexto
  const [cpf, setCpf] = useState(data.cpf || '');
  const [metodoPagamento, setMetodoPagamento] = useState(data.metodoPagamento || '');
  const API_URL = 'http://10.0.2.2:5000/api'; // Ajuste para a URL correta do backend

  // Atualiza o contexto sempre que o CPF ou o método de pagamento forem alterados
  useEffect(() => {
    setData({
      ...data,
      cpf,
      metodoPagamento,
    });
  }, [cpf, metodoPagamento]);

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
    // Verifica se todos os campos estão preenchidos
    if (!cpf || !metodoPagamento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!data.pdfUri || !data.pdfName) {
      Alert.alert('Erro', 'Arquivo PDF não encontrado. Por favor, faça o upload de um PDF válido.');
      return;
    }

    // Criação de FormData com checagem de valores válidos
    const formData = new FormData();
    formData.append('pdfFiles', {
      uri: data.pdfUri as string, // Garantimos que não seja undefined
      name: data.pdfName as string,
      type: 'application/pdf',
    } as any);

    if (data.service) formData.append('tipoServico', data.service);
    if (data.nomeCompleto) formData.append('nomeCompleto', data.nomeCompleto);
    if (data.placaCarro) formData.append('placaVeiculo', data.placaCarro);
    if (data.nomeVeiculo) formData.append('nomeVeiculo', data.nomeVeiculo);
    formData.append('formaPagamento', metodoPagamento);
    formData.append('cpf', cpf);

    try {
      const response = await axios.post(`${API_URL}/upload-pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${data.token}`,
          
        }, 
        timeout: 60000,
      });

      if (!data.token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        return;
      }
      console.log('Token:', data.token);

      Alert.alert('Sucesso', 'Serviço solicitado com sucesso.');
      clearData(); // Limpa o contexto após finalizar o serviço
      router.push({ pathname: '/' }); // Corrige o tipo de navegação
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar o serviço.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <ProgressBar etapaAtual={4} totalEtapas={4} />
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()} // Volta para o upload de PDF
        >
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
