import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Despachante IPVA</Text>
      <Text style={styles.subtitle}>Escolha um serviço abaixo:</Text>
      
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => {/* Navegação */}}>
          <Text style={styles.cardTitle}>Renovação de IPVA</Text>
          <Text style={styles.cardDescription}>Atualize o seu IPVA de forma simples.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => {/* Navegação */}}>
          <Text style={styles.cardTitle}>Transferência de Propriedade</Text>
          <Text style={styles.cardDescription}>Transfira a propriedade do veículo rapidamente.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => {/* Navegação */}}>
          <Text style={styles.cardTitle}>Consulta de Débitos</Text>
          <Text style={styles.cardDescription}>Verifique os débitos do seu veículo.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => {/* Navegação */}}>
          <Text style={styles.cardTitle}>Descontos e Benefícios</Text>
          <Text style={styles.cardDescription}>Confira possíveis descontos e benefícios.</Text>
        </TouchableOpacity>
      </View>
      
      <Link href="/login" style={styles.profileLink}>Ir para o Login</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  profileLink: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
  },
});
