import React, { useState } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FilterButtonProps {
  data: any[]; // Dados brutos (ex: serviços) que serão filtrados
  onFilteredData: (filteredData: any[]) => void; // Callback para enviar os dados filtrados
}

const FilterButton: React.FC<FilterButtonProps> = ({ data, onFilteredData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleApplyFilter = () => {
    let updatedData = [...data];

    if (selectedFilter === 'recent') {
      updatedData.sort((a, b) => {
        const dateA = new Date(a.data_solicitacao.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.data_solicitacao.split('/').reverse().join('-')).getTime();
        return dateB - dateA;
      });
    } else if (selectedFilter === 'oldest') {
      updatedData.sort((a, b) => {
        const dateA = new Date(a.data_solicitacao.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.data_solicitacao.split('/').reverse().join('-')).getTime();
        return dateA - dateB;
      });
    }

    onFilteredData(updatedData); // Envia os dados filtrados para a tela principal
    setModalVisible(false); // Fecha o modal
  };

  return (
    <View>
      <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
        <MaterialIcons name="filter-list" size={16} color="#666" />
        <Text style={styles.filterButtonText}>Filtrar</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={toggleModal}>
                <MaterialIcons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ordenar por data</Text>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === 'recent' && styles.selectedOption,
                ]}
                onPress={() => setSelectedFilter('recent')}
              >
                <MaterialIcons
                  name="arrow-downward"
                  size={16}
                  color={selectedFilter === 'recent' ? '#f5b91e' : '#666'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedFilter === 'recent' && styles.selectedText,
                  ]}
                >
                  Mais recentes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === 'oldest' && styles.selectedOption,
                ]}
                onPress={() => setSelectedFilter('oldest')}
              >
                <MaterialIcons
                  name="arrow-upward"
                  size={16}
                  color={selectedFilter === 'oldest' ? '#f5b91e' : '#666'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedFilter === 'oldest' && styles.selectedText,
                  ]}
                >
                  Mais antigas
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilter}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  optionsContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%', // Reduz a largura das opções
    flexDirection: 'row',
    gap: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginBottom: 10,
    // backgroundColor: '#f8f9fa',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  selectedOption: {
    backgroundColor: '#fff',
    borderColor: '#f5b91e',
    borderWidth: 1,
  },
  selectedText: {
    color: '#f5b91e',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#f5b91e',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FilterButton;
