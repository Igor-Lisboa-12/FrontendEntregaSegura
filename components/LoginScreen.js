import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const theme = {
  primary: '#007BFF',
  secondary: '#0056b3',
  white: '#FFFFFF',
  gray: '#f2f2f2',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  };

  const handleBiometricAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentique-se para acessar',
      fallbackLabel: 'Digite a senha',
    });

    if (result.success) {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        navigation.replace('MainMenuScreen');
      } else {
        Alert.alert('Biometria OK, mas usuário não encontrado. Faça login manualmente.');
      }
    } else {
      Alert.alert('Falha na biometria');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      const response = await api.post('/login', { email, password });
      if (response.status === 200) {
        const userId = response.data.user_id;
        await AsyncStorage.setItem('user_id', userId.toString());
        navigation.replace('MainMenuScreen');
      } else {
        Alert.alert('Erro', 'Credenciais inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha no login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image source={require('../assets/images/adaptive-icon.png')} style={styles.logo} />
      <Text style={styles.title}>Entregas Seguras</Text>
      <Text style={styles.loginIndex}>Login</Text>

      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {isBiometricSupported && (
        <TouchableOpacity style={styles.biometricIcon} onPress={handleBiometricAuth}>
          <Ionicons name="finger-print" size={50} color={theme.white} />
          <Text style={styles.biometricLabel}>Usar biometria</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.primary },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  loginIndex: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { width: '100%', height: 50, marginBottom: 15, paddingLeft: 10, borderRadius: 5, backgroundColor: '#fff' },
  button: { width: '100%', padding: 14, backgroundColor: theme.secondary, borderRadius: 5, marginBottom: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
  biometricIcon: { alignItems: 'center', marginBottom: 20 },
  biometricLabel: { color: theme.white, marginTop: 5, fontSize: 14 },
  link: { color: '#fff', textAlign: 'center', marginTop: 10 },
});

export default LoginScreen;
