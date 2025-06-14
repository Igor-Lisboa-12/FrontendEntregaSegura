import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const theme = {
  primary: '#007BFF',
  secondary: '#0056b3',
  white: '#FFFFFF',
  gray: '#f2f2f2',
};

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [editing, setEditing] = useState(false);

  const fetchUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      setPhoto(response.data.photo_url || null);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro ao buscar usuário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      await api.put(`/users/${userId}`, { ...user, photo_url: photo });
      Alert.alert("Perfil atualizado com sucesso!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro ao atualizar");
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária para acessar a galeria");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setPhoto(result.assets[0].uri);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <TouchableOpacity onPress={editing ? handlePickImage : null}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Selecionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      {editing ? (
        <>
          <TextInput style={styles.input} placeholder="Nome" value={user.name} onChangeText={(text) => setUser({ ...user, name: text })} />
          <TextInput style={styles.input} placeholder="E-mail" value={user.email} onChangeText={(text) => setUser({ ...user, email: text })} />
          <TextInput style={styles.input} placeholder="Telefone" value={user.phone} onChangeText={(text) => setUser({ ...user, phone: text })} />
        </>
      ) : (
        <>
          <View style={styles.textBox}><Text style={styles.text}>{user.name}</Text></View>
          <View style={styles.textBox}><Text style={styles.text}>{user.email}</Text></View>
          <View style={styles.textBox}><Text style={styles.text}>{user.phone}</Text></View>
        </>
      )}

      {editing ? (
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.gray, padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  textBox: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 15 },
  text: { fontSize: 18, color: '#333' },
  button: { backgroundColor: theme.secondary, padding: 14, borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  photo: {
    width: 200, height: 200, borderRadius: 100,
    alignSelf: 'center', marginBottom: 20,
    borderColor: theme.secondary, borderWidth: 3
  },
  placeholder: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: theme.gray, justifyContent: 'center',
    alignItems: 'center', marginBottom: 20, alignSelf: 'center',
    borderColor: theme.secondary, borderWidth: 3
  },
  placeholderText: { color: theme.secondary, fontSize: 16 }
});

export default ProfileScreen;
