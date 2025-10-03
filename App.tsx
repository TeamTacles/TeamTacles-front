import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from './src/contexts/AppContext';
import { RootStackParamList } from "./src/types/Navigation";
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ProjectForm } from './src/screens/ProjectFormScreen'; 
import { TaskForm } from './src/screens/TaskFormScreen';       
import { MenuNavigator } from './src/navigation/MenuNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider> 
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Menu" component={MenuNavigator} />
            </Stack.Group>
            
            <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
              <Stack.Screen name="ProjectForm" component={ProjectForm} />
              <Stack.Screen name="TaskForm" component={TaskForm} />
            </Stack.Group>

          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}