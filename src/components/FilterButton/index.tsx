import React, { useState } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FilterButtonProps {
  data: any[]; // Dados brutos (ex: serviços) que serão filtrados
  onFilteredData: (filteredData: any[]) => void; // Callback para enviar os dados filtrados
}

const FilterButton: React.FC<FilterButtonProps> = ({ data, onFilteredData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleApplyFilter = () => {
    let updatedData = [...data];

    // Aplicar filtro por data
    if (selectedDateFilter === 'recent') {
      updatedData.sort((a, b) => {
        const dateA = new Date(a.data_solicitacao.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.data_solicitacao.split('/').reverse().join('-')).getTime();
        return dateB - dateA;
      });
    } else if (selectedDateFilter === 'oldest') {
      updatedData.sort((a, b) => {
        const dateA = new Date(a.data_solicitacao.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.data_solicitacao.split('/').reverse().join('-')).getTime();
        return dateA - dateB;
      });
    }

    // Aplicar filtro por status
    if (selectedStatusFilter) {
      updatedData = updatedData.filter((item) =>
        item.status_servico.toLowerCase() === selectedStatusFilter.toLowerCase()
      );
    }

    onFilteredData(updatedData); // Envia os dados filtrados para a tela principal
    setModalVisible(false); // Fecha o modal
  };

  const toggleDateFilter = (filter: string) => {
    setSelectedDateFilter((prev) => (prev === filter ? null : filter));
  };

  const toggleStatusFilter = (filter: string) => {
    setSelectedStatusFilter((prev) => (prev === filter ? null : filter));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return '#f5b91e';
      case 'concluído':
        return '#2CA741';
      case 'em andamento':
        return '#0079FD';
      case 'cancelado':
        return '#D73948';
      default:
        return '#ccc';
    }
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
                <MaterialIcons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filtros</Text>
            </View>

            <Text style={styles.sectionTitle}>Ordenar por data</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedDateFilter === 'recent' && styles.selectedOption,
                ]}
                onPress={() => toggleDateFilter('recent')}
              >
                <MaterialIcons
                  name="arrow-downward"
                  size={16}
                  color={selectedDateFilter === 'recent' ? '#f5b91e' : '#666'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedDateFilter === 'recent' && styles.selectedText,
                  ]}
                >
                  Mais recentes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedDateFilter === 'oldest' && styles.selectedOption,
                ]}
                onPress={() => toggleDateFilter('oldest')}
              >
                <MaterialIcons
                  name="arrow-upward"
                  size={16}
                  color={selectedDateFilter === 'oldest' ? '#f5b91e' : '#666'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedDateFilter === 'oldest' && styles.selectedText,
                  ]}
                >
                  Mais antigas
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Filtrar por status</Text>
            <View style={styles.statusContainer}>
              {['pendente', 'concluído', 'em andamento', 'cancelado'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedStatusFilter === status && styles.selectedOption,
                  ]}
                  onPress={() => toggleStatusFilter(status)}
                >
                  <View
                    style={[
                      styles.statusCircle,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedStatusFilter === status && styles.selectedText,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
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
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  optionsContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%', 
    flexDirection: 'row',
    gap: 10,
    padding: 5,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 5,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  statusCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOption: {
    backgroundColor: '#fff',
    borderColor: '#f5b91e',
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
