import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import EjercicioScreen from '../screens/ExerciseScreen';
import NutricionScreen from '../screens/NutritionScreen';
import HealthScreen from '../screens/HealthScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createMaterialBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator sceneAnimationType='shifting' sceneAnimationEnabled={true}>
      <Tab.Screen name="Inicio" component={HomeScreen} options={{
        tabBarIcon: ({ focused }) => {
          return <Icon name={focused ? "home" : "home-outline"} size={25} color={focused ? "black" : "gray"} />;
        },
      }} />
      <Tab.Screen name="Ejercicio" component={EjercicioScreen} options={{
        tabBarIcon: ({ focused }) => {
          return <Icon name={focused ? "run-fast" : "run"} size={25} color={focused ? "black" : "gray"} />;
        },
      }} />
      <Tab.Screen name="Nutrición" component={NutricionScreen} options={{
        tabBarIcon: ({ focused }) => {
          return <Icon name={focused ? 'food-apple' : 'food-apple-outline'} size={25} color={focused ? "black" : "gray"} />;
        },
      }} />
      <Tab.Screen name="Salud" component={HealthScreen} options={{
        tabBarIcon: ({ focused }) => {
          return <Icon name={focused ? 'heart' : 'heart-outline'} size={25} color={focused ? "black" : "gray"} />;
        },
      }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{
        tabBarIcon: ({ focused }) => {
          return <Icon name={focused ? "chat" : "chat-outline"} size={25} color={focused ? "black" : "gray"} />;
        },
      }} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;