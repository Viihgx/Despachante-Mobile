import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar'; // Caminho do componente ProgressBar

export default function EscolherServicoScreen() {
  const router = useRouter();
  const { service, token } = useLocalSearchParams();
  const [scale] = useState(new Animated.Value(1));

  const handleServiceSelection = (service: string) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, easing: Easing.ease, useNativeDriver: true }),
    ]).start(() => {
      router.push({
        pathname: '/informationService',
        params: { service, token },
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <ProgressBar etapaAtual={1} totalEtapas={3} />
        </View>
      </View>


      <Text style={styles.title}>Escolha um serviço:</Text>

      <ScrollView contentContainerStyle={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {['Primeiro Emplacamento', 'Placa Mercosul', 'Segunda Via', 'Transferência Veicular'].map((item, index) => (
          <Animated.View key={index} style={[styles.cardContainer, { transform: [{ scale }] }]}>
            <TouchableOpacity style={styles.card} onPress={() => handleServiceSelection(item)}>
              <Ionicons name="car-outline" size={24} color="#f5b91e" style={styles.icon} />
              <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="tail">
                {item}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#f5b91e" style={styles.arrowIcon} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
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
    paddingTop: 10, // Ajuste para alinhar verticalmente
  },
  
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 30,
    textAlign: 'center',
  },
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingVertical: 10,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: '#ccc',
    minHeight: 60,
  },
  icon: {
    marginRight: 15,
  },
  cardText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  backButton: {
    backgroundColor: '#f5b91e',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#111c55',
    fontSize: 18,
    fontWeight: '600',
  },
});
