import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

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
    const placaRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    if (!vehicleData.placa.trim() || !vehicleData.nome?.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    if (!placaRegex.test(vehicleData.placa)) {
      Alert.alert('Erro', 'Formato de placa inválido. Use o padrão Mercosul (ex: ABC1D23).');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_URL}/api/add-veiculo`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVehicles();
      setModalVisible(false);
      setVehicleData({ placa: '', nome: '' });
    } catch (error) {
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
    <View style={styles.screen}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>

        {/* User Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
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
          <TouchableOpacity
            style={[styles.button, isEditing && styles.saveButton]}
            onPress={handleEditClick}
          >
            <Text style={styles.buttonText}>{isEditing ? 'Salvar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicles */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Meus Veículos</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={28} color="#111c55" />
            </TouchableOpacity>
          </View>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle, index) => (
              <View key={index} style={styles.vehicleCard}>
                <View>
                  <Text style={styles.vehicleText}>{vehicle.placa_veiculo}</Text>
                  {vehicle.nome_veiculo && (
                    <Text style={styles.vehicleSubText}>{vehicle.nome_veiculo}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle.id!)}>
                  <Ionicons name="trash-outline" size={20} color="#ff5252" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noVehicleText}>Nenhum veículo cadastrado</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal for Adding Vehicle */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Veículo</Text>
            <TextInput
              style={styles.input}
              placeholder="Placa do Veículo"
              value={vehicleData.placa}
               maxLength={7}
              onChangeText={(text) => {
                const formattedText = text.toUpperCase();
                setVehicleData({ ...vehicleData, placa: formattedText });
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome do Veículo"
              value={vehicleData.nome}
              onChangeText={(text) => setVehicleData({ ...vehicleData, nome: text })}
            />
            <TouchableOpacity style={styles.button} onPress={handleAddVehicle}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ff5252',
  },
  header: {
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 12,
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#111c55',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#111c55',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  vehicleText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  vehicleSubText: {
    fontSize: 14,
    color: '#777',
  },
  noVehicleText: {
    marginTop: 16,
    fontSize: 14,
    color: '#555',
  },
});

export default UserProfile;
