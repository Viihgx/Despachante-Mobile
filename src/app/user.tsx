import React, { useState } from 'react';
import { TextInput, Text, View, TouchableOpacity, Modal, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Importação do useRouter

// Tipagem para os dados do veículo
interface Vehicle {
  placa: string;
  nome?: string;
}

const UserProfile = () => {
  // Tipagem para o estado do usuário
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Nome do Usuário',
    email: 'email@exemplo.com',
    phone: '(99) 99999-9999',
  });

  const [editedData, setEditedData] = useState(userData);

  // Tipagem e estado dos veículos
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle>({
    placa: '',
    nome: '',
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const router = useRouter(); // Instancia o router para navegação

  const handleEditClick = () => {
    if (isEditing) {
      setUserData(editedData); // Salvar as edições
    }
    setIsEditing(!isEditing); // Alterna o estado de edição
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };

  const handleVehicleChange = (field: keyof Vehicle, value: string) => {
    setVehicleData({
      ...vehicleData,
      [field]: value,
    });
  };

  const handleAddVehicle = () => {
    if (vehicleData.placa.trim() === '') {
      Alert.alert('Erro', 'A placa do veículo é obrigatória.');
      return;
    }

    setVehicles([...vehicles, vehicleData]);
    setVehicleData({ placa: '', nome: '' }); // Limpar campos após salvar
    setModalVisible(false); // Fechar modal
  };

  return (
    <ScrollView style={styles.container}>
      {/* Título principal */}
      <Text style={styles.title}>Perfil do Usuário</Text>

      {/* Seção de "Meus dados" */}
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={handleEditClick}>
          <Ionicons name={isEditing ? 'save' : 'pencil'} size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Meus dados</Text>

      {/* Campos de dados do usuário */}
      <View style={styles.solicitarServicoContainer}>
        <TextInput
          style={styles.input}
          editable={isEditing}
          value={editedData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Nome"
        />
        <TextInput
          style={styles.input}
          editable={isEditing}
          value={editedData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          editable={isEditing}
          value={editedData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          placeholder="Telefone"
        />
      </View>
     {/* Seção de "Meus veículos" */}
     <Text style={styles.subtitle}>Meus veículos</Text>
     <View style={styles.menuContainer}>
       <TouchableOpacity onPress={() => setModalVisible(true)}>
         <Ionicons name="add-circle-outline" size={24} color="black" />
       </TouchableOpacity>
     </View>

     {/* Lista de veículos */}
     {vehicles.length > 0 ? (
       vehicles.map((vehicle, index) => (
         <View key={index} style={styles.vehicleContainer}>
           <Text style={styles.placa}>{vehicle.placa.toUpperCase()}</Text>
           {vehicle.nome ? <Text style={styles.vehicleName}>{vehicle.nome}</Text> : null}
         </View>
       ))
     ) : (
       <Text style={styles.noVehicleText}>Nenhum veículo adicionado.</Text>
     )}

     {/* Modal para adicionar veículos */}
     <Modal visible={modalVisible} transparent={true} animationType="slide">
       <View style={styles.modalContainer}>
         <View style={styles.modalContent}>
           <Text style={styles.modalTitle}>Adicionar Veículo</Text>
           <TextInput
             style={styles.input}
             value={vehicleData.placa}
             onChangeText={(text) => handleVehicleChange('placa', text)}
             placeholder="Placa do Veículo (Obrigatório)"
           />
           <TextInput
             style={styles.input}
             value={vehicleData.nome}
             onChangeText={(text) => handleVehicleChange('nome', text)}
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

     {/* Botão para voltar à tela principal (index) */}
     <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
       <Text style={styles.backButtonText}>Voltar para Home</Text>
     </TouchableOpacity>
   </ScrollView>
 );
};

export default UserProfile;
