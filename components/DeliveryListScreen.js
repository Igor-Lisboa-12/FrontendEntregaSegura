import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  primary: '#007BFF',
  secondary: '#0056b3',
  white: '#FFFFFF',
  gray: '#f2f2f2',
};

const DeliveryListScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      const response = await api.get(`/deliveries/user/${userId}`);
      setDeliveries(response.data);
      setFilteredDeliveries(response.data);
    } catch (error) {
      console.error("Erro ao buscar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDeliveries();
    }, [])
  );

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = deliveries.filter(delivery =>
      (delivery.receiver ?? '').toLowerCase().includes(query) ||
      (delivery.city ?? '').toLowerCase().includes(query) ||
      (delivery.neighborhood ?? '').toLowerCase().includes(query) ||
      (delivery.state ?? '').toLowerCase().includes(query)
    );
    setFilteredDeliveries(filtered);
  }, [search, deliveries]);

  const renderDelivery = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.receiver}</Text>
        <Text style={styles.text}>{item.street}, {item.number}</Text>
        <Text style={styles.text}>{item.city} - {item.state}</Text>
        <Text style={styles.text}>Status: {item.status}</Text>
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: item.id })}
      >
        <Ionicons name="chevron-forward-circle" size={32} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Entregas</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar (nome, cidade, bairro, estado)..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredDeliveries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderDelivery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.gray, padding: 10, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: theme.primary, textAlign: 'center', flex: 1 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontWeight: 'bold', fontSize: 18 },
  text: { fontSize: 16, color: '#333' },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailsButton: { marginLeft: 10 },
      input: { 
    width: '100%', 
    height: 50, 
    marginBottom: 15, 
    paddingLeft: 10, 
    borderRadius: 5, 
    backgroundColor: '#fff',
    color: '#000' 
  },
});

export default DeliveryListScreen;
