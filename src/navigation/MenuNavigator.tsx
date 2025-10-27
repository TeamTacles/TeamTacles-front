import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ProjectScreen } from '../features/project/screens/ProjectScreen';
import { TeamScreen } from '../features/team/screens/TeamScreen';
import { ConfigurationScreen } from '../features/user/screens/ConfigurationScreen';
import { TaskScreen } from '../features/task/screens/TaskScreen';
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

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          if (route.name === 'Projetos') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Tarefas') {
            iconName = focused ? 'reader' : 'reader-outline';
          } else if (route.name === 'Equipes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Mais') {
            iconName = focused ? 'menu' : 'menu-outline';
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
        <Tab.Screen name="Equipes" component={TeamScreen} />
        <Tab.Screen name="Mais" component={ConfigurationScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#232323',
        borderTopWidth: 0,
    },
});