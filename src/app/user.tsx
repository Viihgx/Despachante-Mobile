import React, { useState, useEffect } from 'react';
import { TextInput, Text, View, TouchableOpacity, Modal, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Navbar from '../components/NavBar';

interface Vehicle {
  id?: number;
  placa: string;
  nome?: string;
  placa_veiculo?: string;
  nome_veiculo?: string;
}

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [editedData, setEditedData] = useState(userData);
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle>({ placa: '', nome: '' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const router = useRouter();
  const API_URL = 'http://10.0.2.2:5000/api';
  
  useEffect(() => {
    fetchUserData();
    fetchVehicles();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.push('/login');
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
      setVehicles(response.data.vehicles || []);
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
      fetchVehicles();
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
      fetchVehicles();
      Alert.alert('Sucesso', 'Veículo excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      Alert.alert('Erro', 'Não foi possível excluir o veículo');
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={25} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil do Usuário</Text>
        <TouchableOpacity onPress={handleEditClick} style={styles.editButton}>
          <Ionicons name={isEditing ? 'save-outline' : 'pencil-outline'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meus Dados</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={editedData.name}
            onChangeText={(text) => setEditedData({ ...editedData, name: text })}
            placeholder="Nome"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={editedData.email}
            onChangeText={(text) => setEditedData({ ...editedData, email: text })}
            placeholder="Email"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={editedData.phone}
            onChangeText={(text) => setEditedData({ ...editedData, phone: text })}
            placeholder="Telefone"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.sectionTitle}>Meus Veículos</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#007bff" />
          </TouchableOpacity>
        </View>
        {vehicles.length > 0 ? (
          vehicles.map((vehicle, index) => (
            <View key={index} style={styles.vehicleContainer}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.placa}>{vehicle.placa_veiculo?.toUpperCase() || 'Placa não disponível'}</Text>
                {vehicle.nome_veiculo && <Text style={styles.vehicleName}>{vehicle.nome_veiculo}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle.id!)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noVehicleText}>Não há veículos cadastrados.</Text>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Veículo</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.placa}
              onChangeText={(text) => setVehicleData({ ...vehicleData, placa: text.toUpperCase() })}
              placeholder="Placa do Veículo"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={vehicleData.nome}
              onChangeText={(text) => setVehicleData({ ...vehicleData, nome: text })}
              placeholder="Nome do Veículo (Opcional)"
              placeholderTextColor="#999"
            />
            <Pressable style={styles.button} onPress={handleAddVehicle}>
              <Text style={styles.buttonText}>Salvar</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
    <Navbar/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 50,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
  },
  vehicleInfo: {
    flex: 1,
  },
  placa: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  vehicleName: {
    fontSize: 14,
    color: '#777',
  },
  noVehicleText: {
    fontSize: 16,
    color: '#888',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
});

export default UserProfile;
