import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ProgressBar from '../components/ProgressBar';
import { useFlowContext } from '../contexts/FlowContext';

export default function InformationService() {
  const router = useRouter();
  const { data, setData } = useFlowContext(); // Usando o contexto para persistência
  const [nomeCompleto, setNomeCompleto] = useState(data.nomeCompleto || ''); // Carrega do contexto ou vazio
  const [placaCarro, setPlacaCarro] = useState(data.placaCarro || '');
  const [nomeVeiculo, setNomeVeiculo] = useState(data.nomeVeiculo || '');

  // O serviço já está armazenado no contexto
  const service = data.service || 'Serviço não selecionado';

  const formatPlaca = (value: string) => {
    value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (value.length > 7) value = value.slice(0, 7);

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

    // Salvar os dados no contexto, incluindo o serviço
    setData({
      service, // Garante que o serviço continue disponível
      nomeCompleto,
      placaCarro,
      nomeVeiculo,
    });

    // Navegar para a próxima etapa
    router.push('/uploadPdf');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <ProgressBar etapaAtual={2} totalEtapas={4} />
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Preencha as informações abaixo:</Text>
        <Text style={styles.serviceText}>
          Serviço escolhido: {service ? service : 'Nenhum serviço selecionado'}
        </Text>
      </View>


      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome completo"
            value={nomeCompleto}
            onChangeText={setNomeCompleto}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Placa do Carro</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a placa do carro"
            value={placaCarro}
            onChangeText={formatPlaca}
            maxLength={7}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apelido do Veículo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do veículo"
            value={nomeVeiculo}
            onChangeText={setNomeVeiculo}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            router.back(); // Volta para o "Escolher Serviço"
          }}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Mesmos estilos que você forneceu
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111c55',
    marginTop: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
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
