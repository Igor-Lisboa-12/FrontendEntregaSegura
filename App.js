import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import DeliveryListScreen from './components/DeliveryListScreen';
import AddDeliveryScreen from './components/AddDeliveryScreen';
import CompletedDeliveriesScreen from './components/CompletedDeliveriesScreen';
import DeliveryDetailsScreen from './components/DeliveryDetailsScreen';

import MainMenuScreen from './screens/MainMenuScreen';

const theme = {
  primary: '#007BFF',
  secondary: '#0056b3',
  white: '#FFFFFF',
  gray: '#f2f2f2',
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainMenuScreen" component={MainMenuScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DeliveryListScreen" component={DeliveryListScreen} />
        <Stack.Screen name="AddDeliveryScreen" component={AddDeliveryScreen} />
        <Stack.Screen name="CompletedDeliveriesScreen" component={CompletedDeliveriesScreen} />
        <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.primary,
  },
  text: {
    color: theme.white,
    fontSize: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
