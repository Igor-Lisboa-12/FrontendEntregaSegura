import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const theme = {
  primary: '#007BFF',
  secondary: '#0056b3',
  white: '#FFFFFF',
  gray: '#f2f2f2',
};

const AddDeliveryScreen = ({ navigation }) => {
  const [receiver, setReceiver] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');

  useFocusEffect(
    useCallback(() => {
      setReceiver('');
      setCep('');
      setStreet('');
      setNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('');
      setState('');
      setDescription('');
    }, [])
  );

  const handleAddDelivery = async () => {
    if (!receiver || !cep || !street || !number || !neighborhood || !city || !state) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }

      const response = await api.post('/deliveries', {
        receiver,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        description,
        status: "Em andamento",
        user_id: parseInt(userId)
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Entrega cadastrada com sucesso');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar entrega');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao tentar cadastrar entrega');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nova Entrega</Text>

      <TextInput style={styles.input} placeholder="Destinatário" value={receiver} onChangeText={setReceiver} />
      <TextInput style={styles.input} placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Rua" value={street} onChangeText={setStreet} />
      <TextInput style={styles.input} placeholder="Número" value={number} onChangeText={setNumber} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Complemento (opcional)" value={complement} onChangeText={setComplement} />
      <TextInput style={styles.input} placeholder="Bairro" value={neighborhood} onChangeText={setNeighborhood} />
      <TextInput style={styles.input} placeholder="Cidade" value={city} onChangeText={setCity} />
      <TextInput style={styles.input} placeholder="Estado" value={state} onChangeText={setState} />
      <TextInput style={styles.input} placeholder="Descrição da Entrega" value={description} onChangeText={setDescription} multiline />

      <TouchableOpacity style={styles.button} onPress={handleAddDelivery}>
        <Text style={styles.buttonText}>Cadastrar Entrega</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.gray, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.primary, marginBottom: 20, textAlign: 'center' },
    input: { 
    width: '100%', 
    height: 50, 
    marginBottom: 15, 
    paddingLeft: 10, 
    borderRadius: 5, 
    backgroundColor: '#fff',
    color: '#000'
  },
  button: { width: '100%', padding: 14, backgroundColor: theme.secondary, borderRadius: 5, marginVertical: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
});

export default AddDeliveryScreen;
