import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const DeliveryMap = ({ address }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const geocodeAddress = async () => {
    try {
      const apiKey = '3701732eb40747f6810b9b7fa90a52be';
      const encodedAddress = encodeURIComponent(address);
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${apiKey}&language=pt-BR&countrycode=br`;

      console.log("Chamando OpenCage:", url);

      const response = await axios.get(url);

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        setLocation({ latitude: lat, longitude: lng });
      } else {
        console.warn('Endereço não encontrado na API.');
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    geocodeAddress();
  }, [address]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  if (!location) {
    return (
      <View style={styles.noLocationContainer}>
        <Text style={styles.errorText}>Não foi possível obter a localização para este endereço.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={location} title="Local de Entrega" />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  noLocationContainer: {
    padding: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  errorText: {
    color: '#333',
    textAlign: 'center',
  },
});

export default DeliveryMap;
