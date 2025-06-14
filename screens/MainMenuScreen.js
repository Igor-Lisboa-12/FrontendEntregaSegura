import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DeliveryListScreen from '../components/DeliveryListScreen';
import AddDeliveryScreen from '../components/AddDeliveryScreen';
import ProfileScreen from '../components/ProfileScreen';
import CompletedDeliveriesScreen from '../components/CompletedDeliveriesScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const theme = {
  primary: '#007BFF',
  secondary: '#0056b3',
  white: '#FFFFFF',
  gray: '#f2f2f2',
};

export default function MainMenuScreen() {
  return (
    <Tab.Navigator
      initialRouteName="Entregas"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.white,
        tabBarInactiveTintColor: theme.gray,
        tabBarStyle: { backgroundColor: theme.primary },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Entregas') iconName = 'list';
          if (route.name === 'Nova Entrega') iconName = 'add-circle';
          if (route.name === 'Perfil') iconName = 'person-circle';
          if (route.name === 'Concluídas') iconName = 'checkmark-done';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Entregas" component={DeliveryListScreen} />
      <Tab.Screen name="Concluídas" component={CompletedDeliveriesScreen} />
      <Tab.Screen name="Nova Entrega" component={AddDeliveryScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
