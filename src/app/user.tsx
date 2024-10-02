import React, { useState, useEffect } from 'react';
import { TextInput, Text, View, TouchableOpacity, Modal, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Para armazenar o token de forma segura

interface Vehicle {
  id?: number;
  placa: string;
  nome?: string;
}

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [editedData, setEditedData] = useState(userData);
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle>({ placa: '', nome: '' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const router = useRouter();
  const API_URL = 'http://192.168.0.20:5001/api'; // Ajuste a URL do seu backend
  
  useEffect(() => {
    fetchUserData();
    fetchVehicles();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.push('/login'); // Redireciona para a tela de login
        return;
      }

      const response = await axios.get(`${API_URL}/api/user-data-usuario`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setEditedData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_URL}/api/veiculos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data.vehicles); // Recebendo o array de veículos
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      setVehicles([]);
    }
  };

  const handleEditClick = async () => {
    if (isEditing) {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        await axios.put(`${API_URL}/api/update-user`, editedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(editedData);
        Alert.alert('Sucesso', 'Dados atualizados com sucesso');
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível atualizar os dados do usuário');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleAddVehicle = async () => {
    if (vehicleData.placa.trim() === '') {
      Alert.alert('Erro', 'A placa do veículo é obrigatória.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_URL}/api/add-veiculo`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVehicles();  // Atualiza a lista de veículos
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o veículo');
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_URL}/api/delete-veiculo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVehicles(); // Atualiza a lista de veículos
      Alert.alert('Sucesso', 'Veículo excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      Alert.alert('Erro', 'Não foi possível excluir o veículo');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Perfil do Usuário</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={handleEditClick}>
          <Ionicons name={isEditing ? 'save' : 'pencil'} size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Meus dados</Text>
      <View style={styles.solicitarServicoContainer}>
        <TextInput
          style={styles.input}
          editable={isEditing}
          value={editedData.name}
          onChangeText={(text) => setEditedData({ ...editedData, name: text })}
          placeholder="Nome"
        />
        <TextInput
          style={styles.input}
          editable={isEditing}
          value={editedData.email}
          onChangeText={(text) => setEditedData({ ...editedData, email: text })}
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          editable={isEditing}
          value={editedData.phone}
          onChangeText={(text) => setEditedData({ ...editedData, phone: text })}
          placeholder="Telefone"
        />
      </View>

      <Text style={styles.subtitle}>Meus veículos</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {vehicles.length > 0 ? (
        vehicles.map((vehicle, index) => (
          <View key={index} style={styles.vehicleContainer}>
            <Text style={styles.placa}>{vehicle.placa.toUpperCase()}</Text>
            {vehicle.nome ? <Text style={styles.vehicleName}>{vehicle.nome}</Text> : null}
            <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle.id!)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))
      ) : null}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Veículo</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.placa}
              onChangeText={(text) => setVehicleData({ ...vehicleData, placa: text })}
              placeholder="Placa do Veículo (Obrigatório)"
            />
            <TextInput
              style={styles.input}
              value={vehicleData.nome}
              onChangeText={(text) => setVehicleData({ ...vehicleData, nome: text })}
              placeholder="Nome do Veículo (Opcional)"
            />
            <Pressable style={styles.button} onPress={handleAddVehicle}>
              <Text style={styles.buttonText}>Salvar</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: 'red' }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>Voltar para Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      marginTop: 35,
      backgroundColor: '#f5f5f5',
    },
    menuContainer: {
      alignItems: 'flex-end',
      marginBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 18,
      color: '#666',
      textAlign: 'left',
      marginBottom: 20,
    },
    solicitarServicoContainer: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    input: {
      backgroundColor: '#f9f9f9',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      elevation: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      fontSize: 16,
      color: '#333',
    },
    vehicleContainer: {
      marginBottom: 20,
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ddd',
      alignItems: 'center',
    },
    placa: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      backgroundColor: '#e0e0e0',
      padding: 10,
      borderRadius: 5,
      letterSpacing: 2,
      textAlign: 'center',
      width: '100%',
    },
    vehicleName: {
      fontSize: 16,
      color: '#666',
      marginTop: 5,
      textAlign: 'center',
    },
    noVehicleText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    backButton: {
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
      alignItems: 'center',
    },
    backButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
