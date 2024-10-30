import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

  // Função para formatar o CPF
  const formatCpf = (value: string) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Limita o valor a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    // Adiciona pontos e traço conforme o usuário digita
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
    if (!cpf || !metodoPagamento || !tipoServico) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const formData = new FormData();

    // Certifique-se de que `pdfUri` e `pdfName` são strings antes de usá-los
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

    console.log("PDF URI:", pdfUri);
    console.log("PDF Name:", pdfName);
    console.log("Tipo de Serviço:", tipoServico);
    console.log("Nome Completo:", nome);
    console.log("Método de Pagamento:", metodoPagamento);
    console.log("Placa do Veículo:", placa);
    console.log("Nome do Veículo:", veiculo);

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
      console.log('Resposta do servidor:', response.data);

      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer upload de PDFs:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar o serviço.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações de Pagamento</Text>

      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={formatCpf}
        keyboardType="numeric"
        maxLength={14} // Limita o input a 14 caracteres (formato 000.000.000-00)
      />

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

      <TouchableOpacity style={styles.submitButton} onPress={handlePaymentSubmit}>
        <Text style={styles.submitButtonText}>Finalizar</Text>
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
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
