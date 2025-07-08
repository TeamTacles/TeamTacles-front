import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ProjectScreen } from '../screens/ProjectScreen';
import { InProgressScreen } from '../screens/InProgressScreen';
import { TaskScreen } from '../screens/TaskScreen'; 
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { RootTabParamList } from '../types/Navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const MenuNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#EB5F1C', 
        tabBarInactiveTintColor: 'gray',
        tabBarPressColor: 'transparent',   

        // Existe uma biblioteca no expo que já contém os ícones para utilizarmos. Importei ele código acima. Abaixo é veificado em qual aba estamos, e a depender da aba o preencimento do ícone muda e ele recebe o focus, mudando de cor
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          if (route.name === 'Projetos') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tarefas') {
            iconName = focused ? 'reader' : 'reader-outline';
          } else if (route.name === 'Equipe') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'ellipse';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: styles.tabBar,
      })}
    >
        <Tab.Screen name="Projetos" component={ProjectScreen} />
        <Tab.Screen name="Tarefas" component={TaskScreen} />
        <Tab.Screen name="Equipe" component={InProgressScreen} />
        <Tab.Screen name="Configurações" component={InProgressScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#232323',
        borderTopWidth: 0,
        paddingBottom: 5,
    },
});