import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';
import { useFlowContext } from '../contexts/FlowContext';
import * as SecureStore from 'expo-secure-store'; // Importa SecureStore

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

export default function EscolherServicoScreen() {
  const router = useRouter();
  const { setData, clearData } = useFlowContext(); // Inclui clearData do contexto
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [scale] = useState(new Animated.Value(1));
  const [token, setToken] = useState<string | null>(null); // Estado para armazenar o token

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        if (storedToken) {
          setToken(storedToken); // Armazena o token no estado
        } else {
          console.log('Token não encontrado');
        }
      } catch (error) {
        console.error('Erro ao obter o token:', error);
      }
    };

    fetchToken(); // Chama a função para recuperar o token
  }, []);

  const toggleExpand = (service: string) => {
    if (expandedCard === service) {
      setExpandedCard(null);
    } else {
      setExpandedCard(service);
    }
  };

  const handleServiceSelection = (service: string) => {
    if (!token) {
      Alert.alert('Erro', 'Token de autenticação não encontrado. Por favor, faça login novamente.');
      return; // Retorna se não houver token
    }

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, easing: Easing.ease, useNativeDriver: true }),
    ]).start(() => {
      // Salva o serviço selecionado no contexto
      setData({ service, token }); // Inclui o token ao salvar o serviço

      // Navega para a próxima etapa
      router.push({
        pathname: '/informationService',
      });
    });
  };

  const handleBackToHome = () => {
    // Limpa todos os dados ao voltar para a home
    clearData();
    router.push('/'); // Redireciona para a home
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar etapaAtual={1} totalEtapas={4} />
      </View>

      <Text style={styles.title}>Escolha um serviço:</Text>

      <ScrollView contentContainerStyle={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(serviceDetails).map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleExpand(item)}
            >
              <Ionicons name="car-outline" size={24} color="#f5b91e" style={styles.icon} />
              <Text style={styles.cardTitle}>{item}</Text>
              <Ionicons
                name={expandedCard === item ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#f5b91e"
              />
            </TouchableOpacity>

            {expandedCard === item && (
              <Animated.View key={index} style={[styles.cardDetails, { transform: [{ scale }] }]}>
                <Text style={styles.documentsTitle}>Documentos Necessários:</Text>

                {serviceDetails[item].map((detail, idx) => (
                  <Text key={idx} style={styles.detailText}>
                    • {detail}
                  </Text>
                ))}

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => handleServiceSelection(item)}
                >
                  <Text style={styles.selectButtonText}>Selecionar</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleBackToHome} // Chama a função para limpar dados e voltar
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Estilos permanecem os mesmos
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    overflow: 'hidden',
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  icon: {
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 10,
  },
  cardDetails: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: '#f5b91e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#f5b91e',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#111c55',
    fontSize: 18,
    fontWeight: '600',
  },
});
