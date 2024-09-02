import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';  // Ícone de menu
import { Menu, MenuItem } from 'react-native-material-menu'; 

interface Servico {
  tipo_servico: string;
  forma_pagamento: string;
  status_servico: string;
  data_solicitacao: string;
  file_pdfs: string[]; 
}

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [menuVisible, setMenuVisible] = useState(false); // Controla a visibilidade do menu
  const API_URL = 'http://192.168.18.20:5000';  // Substitua pela URL do seu backend
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert('Erro', 'Usuário não autenticado');
          router.push('/login'); //tela login
          return;
        }

        const userResponse = await axios.get(`${API_URL}/api/user-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUserName(userResponse.data.name);

        const servicosResponse = await axios.get(`${API_URL}/api/meus-servicos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // console.log('Dados dos serviços:', servicosResponse.data.servicos);

        // Certifica que file_pdfs seja sempre um array
        const servicosComPdfs = servicosResponse.data.servicos.map((servico: any) => {
          let file_pdfs = servico.file_pdfs;

          if (typeof file_pdfs === 'string') {
            // Se file_pdfs for uma string, converta para um array
            file_pdfs = [file_pdfs];
          } else if (!Array.isArray(file_pdfs)) {
            // Se não for array, defina como um array vazio
            file_pdfs = [];
          }

          return {
            ...servico,
            file_pdfs,
          };
        });

        setServicos(servicosComPdfs);

      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken'); // Remove o token
    router.push('/login'); // Redireciona para a tela de login
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Ícone de menu no canto superior direito */}
      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          anchor={
            <TouchableOpacity onPress={toggleMenu}>
              <MaterialIcons name="menu" size={28} color="black" />
            </TouchableOpacity>
          }
          onRequestClose={toggleMenu}
        >
          <MenuItem onPress={handleLogout}>Sair</MenuItem>
        </Menu>
      </View>

      <Text style={styles.title}>Olá, {userName}</Text>
      <Text style={styles.subtitle}>Seja bem-vindo de volta</Text>

      <View style={styles.solicitarServicoContainer}>
        <Text style={styles.servicosTitle}>Solicite um serviço:</Text>
        <TouchableOpacity style={styles.solicitarServicoButton}>
          <Text style={styles.solicitarServicoText}>Solicitar Serviço</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.servicosSection}>
        <Text style={styles.servicosTitle}>Meus Serviços:</Text>

        <ScrollView contentContainerStyle={styles.servicosContainer}>
          {servicos.length > 0 ? (
            servicos.map((servico, index) => (
              <View key={index} style={styles.servicoCard}>
                <Text style={styles.servicoText}>Tipo de Serviço: {servico.tipo_servico}</Text>
                <Text style={styles.servicoText}>Forma de Pagamento: {servico.forma_pagamento}</Text>
                <Text style={styles.servicoText}>Status: {servico.status_servico}</Text>
                <Text style={styles.servicoText}>Data da Solicitação: {new Date(servico.data_solicitacao).toLocaleDateString()}</Text>
                
                {servico.file_pdfs.length > 0 && (
                  <View>
                    {servico.file_pdfs.map((fileUrl, fileIndex) => (
                      <TouchableOpacity
                        key={fileIndex}
                        style={styles.downloadButton}
                        onPress={() => handleDownload(fileUrl)}
                      >
                        <Text style={styles.downloadText}>Baixar PDF {fileIndex + 1}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noServicosText}>Você ainda não solicitou nenhum serviço.</Text>
          )}
        </ScrollView>
      </View>

      <Link href="/login" style={styles.profileLink}>Ir para o Login</Link>
    </View>
  );
}

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
  solicitarServicoButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  solicitarServicoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  servicosSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
  },
  servicosTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
  },
  servicosContainer: {
    flexGrow: 1,
  },
  servicoCard: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  servicoText: {
    fontSize: 16,
    color: '#333',
  },
  noServicosText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  profileLink: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 10,
  },
  downloadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
  },
});
