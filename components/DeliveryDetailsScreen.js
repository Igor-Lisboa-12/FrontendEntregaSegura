import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DeliveryDetailsScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const [receivedBy, setReceivedBy] = useState('');
  const [cpfReceiver, setCpfReceiver] = useState('');
  const [relation, setRelation] = useState('');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const response = await api.get(`/deliveries/details/${deliveryId}`);
        setDeliveryDetails(response.data);
        geocodeAddress(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes da entrega');
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryDetails();
  }, [deliveryId]);

  const geocodeAddress = async (delivery) => {
    try {
      const address = `${delivery.street}, ${delivery.number} ${delivery.neighborhood}, ${delivery.city} - ${delivery.state}, ${delivery.cep}`;
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=3701732eb40747f6810b9b7fa90a52be`);
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        setCoordinates({ latitude: lat, longitude: lng });
      }
    } catch (err) {
      console.error('Erro ao buscar coordenadas:', err);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária para acessar a câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.cancelled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!receivedBy || !cpfReceiver || !relation || !photo) {
      Alert.alert('Erro', 'Preencha todos os campos e tire a foto');
      return;
    }

    try {
      setConfirming(true);
      const response = await api.put(`/deliveries/${deliveryId}/confirm`, {
        received_by: receivedBy,
        cpf_receiver: cpfReceiver,
        relation: relation,
        photo_url: photo,
      });

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Entrega confirmada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Erro ao confirmar entrega.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao confirmar a entrega');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!deliveryDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Entrega não encontrada.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes da Entrega</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Destinatário:</Text>
        <Text style={styles.value}>{deliveryDetails.receiver}</Text>

        <Text style={styles.label}>Endereço:</Text>
        <Text style={styles.value}>
          {deliveryDetails.street}, {deliveryDetails.number} {deliveryDetails.complement && `, ${deliveryDetails.complement}`}
        </Text>
        <Text style={styles.value}>{deliveryDetails.neighborhood}, {deliveryDetails.city} - {deliveryDetails.state} | CEP: {deliveryDetails.cep}</Text>

        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{deliveryDetails.description || 'Sem descrição'}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{deliveryDetails.status}</Text>
      </View>

      {coordinates && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          <Marker coordinate={coordinates} />
        </MapView>
      )}

      {deliveryDetails.status !== 'Concluído' ? (
        <>
          <Text style={styles.subtitle}>Confirmar Entrega:</Text>
          <TextInput style={styles.input} placeholder="Nome de quem recebeu" value={receivedBy} onChangeText={setReceivedBy} />
          <TextInput style={styles.input} placeholder="CPF de quem recebeu" value={cpfReceiver} onChangeText={setCpfReceiver} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Relação com o destinatário" value={relation} onChangeText={setRelation} />

          <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>Tirar Foto da Localização</Text>
          </TouchableOpacity>

          {photo && <Image source={{ uri: photo }} style={styles.image} />}

          <TouchableOpacity style={styles.button} onPress={handleConfirmDelivery} disabled={confirming}>
            <Text style={styles.buttonText}>{confirming ? 'Confirmando...' : 'Confirmar Entrega'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Entrega Confirmada:</Text>
          <Text style={styles.value}>Recebido por: {deliveryDetails.received_by}</Text>
          <Text style={styles.value}>CPF: {deliveryDetails.cpf_receiver}</Text>
          <Text style={styles.value}>Relação: {deliveryDetails.relation}</Text>
          {deliveryDetails.photo_url ? (
            <Image source={{ uri: deliveryDetails.photo_url }} style={styles.image} />
          ) : (
            <Text style={styles.value}>Sem foto registrada.</Text>
          )}
        </>
      )}

      <TouchableOpacity style={[styles.button, { backgroundColor: '#666' }]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f2f2f2', padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007BFF', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginVertical: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 30 },
  label: { fontWeight: 'bold', color: '#007BFF', fontSize: 18 },
  value: { fontSize: 18, marginBottom: 10, color: '#333' },
    input: { 
    width: '100%', 
    height: 50, 
    marginBottom: 15, 
    paddingLeft: 10, 
    borderRadius: 5, 
    backgroundColor: '#fff',
    color: '#000' 
  },
  button: { width: '100%', padding: 14, backgroundColor: '#0056b3', borderRadius: 5, marginVertical: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
  cameraButton: { width: '100%', padding: 14, backgroundColor: '#007BFF', borderRadius: 5, marginBottom: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  map: { width: '100%', height: 300, marginBottom: 20 },
  errorText: { fontSize: 20, color: 'red', textAlign: 'center', marginBottom: 20 },
});

export default DeliveryDetailsScreen;
