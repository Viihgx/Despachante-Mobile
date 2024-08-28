import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [services, setServices] = useState([]); // Inicialmente vazio, a lógica para carregar serviços será adicionada depois
  const API_URL = 'http://192.168.18.20:5000';  // Substitua pela URL do seu backend

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Recupera o token armazenado
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert('Erro', 'Usuário não autenticado');
          return;
        }

        // Faz a requisição para a rota protegida (exemplo para buscar dados do usuário)
        const response = await axios.get(`${API_URL}/api/user-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Define o nome do usuário
        setUserName(response.data.name);

        // Aqui você pode fazer outra requisição para buscar os serviços do usuário
        // setServices(response.data.services); // Isso é só um exemplo
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
      }
    };

    fetchUserData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Olá, {userName}, Seja Bem-Vindo de Volta</Text>

      <View style={styles.serviceRequestContainer}>
        <Text style={styles.sectionTitle}>Solicite um serviço:</Text>
        <TouchableOpacity style={styles.requestButton} onPress={() => { /* Navegação para solicitar serviço */ }}>
          <Text style={styles.requestButtonText}>Solicitar Serviço</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Seus Serviços:</Text>
        {services.length === 0 ? (
          <Text style={styles.noServicesText}>Você ainda não solicitou nenhum serviço.</Text>
        ) : (
          services.map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceItem} onPress={() => { /* Navegação para detalhes do serviço */ }}>
              <Text style={styles.serviceItemText}>{service}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      <Link href="/login">Ir para o Login</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 30,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  serviceRequestContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requestButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noServicesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  serviceItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  serviceItemText: {
    fontSize: 16,
    color: '#333',
  },
});
