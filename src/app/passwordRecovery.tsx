import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';

const PasswordRecovery = () => {
  const [step, setStep] = useState(1); // Controla o estado: 1 = enviar PIN, 2 = validar PIN, 3 = redefinir senha
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigation = useNavigation(); // Para navegação
  const API_URL = 'http://10.0.2.2:5000/api';

  // Enviar PIN para o e-mail
  const handleSendPin = async () => {
    try {
      const response = await axios.post(`${API_URL}/send-pin`, { email });
      if (response.data.success) {
        Alert.alert('Sucesso', 'PIN enviado para o seu e-mail.');
        setStep(2); // Avança para o próximo passo (validar PIN)
      } else {
        Alert.alert('Erro', response.data.message || 'E-mail não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao enviar PIN:', error);
      Alert.alert('Erro', 'Não foi possível enviar o PIN.');
    }
  };

  // Confirmar o PIN
  const handleConfirmPin = async () => {
    try {
      const response = await axios.post(`${API_URL}/validate-pin`, { email, pin });
      if (response.data.success) {
        Alert.alert('Sucesso', 'PIN validado. Redefina sua senha.');
        setStep(3); // Avança para o próximo passo (redefinir senha)
      } else {
        Alert.alert('Erro', response.data.message || 'PIN inválido.');
      }
    } catch (error) {
      console.error('Erro ao validar PIN:', error);
      Alert.alert('Erro', 'Não foi possível validar o PIN.');
    }
  };

  // Redefinir senha
  const handleResetPassword = async () => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        newPassword,
      });
      if (response.data.success) {
        Alert.alert('Sucesso', 'Senha redefinida com sucesso.');
        router.push('/login'); // Volta para a tela de login
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao redefinir senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      Alert.alert('Erro', 'Não foi possível redefinir a senha.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111c55" />
        </TouchableOpacity>
       
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <>
           <Text style={styles.title}>Recuperar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button} onPress={handleSendPin}>
              <Text style={styles.buttonText}>Enviar PIN</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Digite o PIN recebido"
              placeholderTextColor="#aaa"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleConfirmPin}>
              <Text style={styles.buttonText}>Confirmar PIN</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Digite sua nova senha"
              placeholderTextColor="#aaa"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Redefinir Senha</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111c55',
  },
  content: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#111',
    marginBottom: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    backgroundColor: '#111c55',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PasswordRecovery;
