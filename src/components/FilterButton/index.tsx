import React, { useState } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StatusIndicator from '../StatusIndicator';

interface FilterButtonProps {
  onFilter: (filterType: string, filterValue: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onFilter }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateOrder, setSelectedDateOrder] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleDateOrderChange = (itemValue: string) => {
    setSelectedDateOrder(itemValue);
    onFilter('dateOrder', itemValue);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilter('status', status);
  };

  return (
    <View>
      <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
        <MaterialIcons name="filter-list" size={24} color="#555" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar</Text>

            {/* Filtro por data */}
            <Text style={styles.label}>Ordenar por data:</Text>
            <TouchableOpacity onPress={() => handleDateOrderChange('recent')} style={styles.optionButton}>
              <Text style={selectedDateOrder === 'recent' ? styles.selectedOptionText : styles.optionText}>
                Mais recentes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDateOrderChange('oldest')} style={styles.optionButton}>
              <Text style={selectedDateOrder === 'oldest' ? styles.selectedOptionText : styles.optionText}>
                Mais antigas
              </Text>
            </TouchableOpacity>

            {/* Filtro por status com bolinhas de cor */}
            <Text style={styles.label}>Filtrar por status:</Text>
            {['pendente', 'concluido', 'em andamento', 'cancelado'].map((status) => (
              <TouchableOpacity key={status} onPress={() => handleStatusChange(status)} style={styles.optionButton}>
                <StatusIndicator status={status} /> 
                <Text style={selectedStatus === status ? styles.selectedOptionText : styles.optionText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#111c55',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#111c55',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterButton;
