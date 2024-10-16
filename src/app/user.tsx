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
  const API_URL = 'http://192.168.0.18:5001/api'; // Ajuste a URL do seu backend
  
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
      if (response.data.vehicles && response.data.vehicles.length > 0) {
        setVehicles(response.data.vehicles); // Recebendo o array de veículos
      } else {
        setVehicles([]); // Se não houver veículos
      }
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
            <Text style={styles.placa}>{vehicle.placa ? vehicle.placa.toUpperCase() : 'Placa não disponível'}</Text>
            {vehicle.nome ? <Text style={styles.vehicleName}>{vehicle.nome}</Text> : null}
            <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle.id!)} >
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noVehicleText}>Não há veículos cadastrados.</Text>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Veículo</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.placa}
              onChangeText={(text) => setVehicleData({ ...vehicleData, placa: text.toUpperCase() })}
              placeholder="Placa do Veículo (Obrigatório)"
              keyboardType="default" // Permite letras e números
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  solicitarServicoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  vehicleContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  placa: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleName: {
    fontSize: 16,
    color: '#666',
  },
  noVehicleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
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
