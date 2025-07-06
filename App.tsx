import React from "react";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { RootStackParamList } from "./types/Navigation";
import { MenuNavigator } from './navigation/MenuNavigator'; 
import { ProjectForm } from './screens/ProjectFormScreen';
import { TaskForm } from './screens/TaskFormScreen';

// pilha de navegação
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Menu" component={MenuNavigator} />
          <Stack.Screen name="ProjectForm" component={ProjectForm} />
          <Stack.Screen name="TaskForm" component={TaskForm} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}