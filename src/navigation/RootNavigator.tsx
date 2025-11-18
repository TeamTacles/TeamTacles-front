import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { RootStackParamList } from "../types/Navigation";
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { MenuNavigator } from './MenuNavigator';
import { EditProfileScreen } from '../features/user/screens/EditProfileScreen';
import { TeamDetailScreen } from '../features/team/screens/TeamDetailScreen';
import { ProjectDetailScreen } from '../features/project/screens/ProjectDetailScreen';
import { ReportCenterScreen } from '../features/project/screens/ReportCenterScreen';
import { TaskDetailScreen } from '../features/task/screens/TaskDetailScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen'; 
import { OnboardingNavigator, PostLoginNavigator } from '../features/onboarding/navigation/OnboardingNavigator';
import { PostLoginOnboardingScreen } from '../features/onboarding/screens/PostLoginOnboardingScreen'; // Importado

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navegador para o fluxo NÃO AUTENTICADO 
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

  </Stack.Navigator>
);

// Navegador para o fluxo AUTENTICADO
const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false }}>
    <Stack.Group screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Menu" component={MenuNavigator} />
    </Stack.Group>
    
    <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ReportCenter" component={ReportCenterScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} /> 
      <Stack.Screen name="PostLoginTutorial" component={PostLoginOnboardingScreen} />
    </Stack.Group>
  </Stack.Navigator>
);

const RootNavigator = () => {
  // PEGUE OS NOVOS ESTADOS DO CONTEXTO
  const { signed, loading, showOnboarding, showPostLoginOnboarding} = useAppContext();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EB5F1C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {showOnboarding ? (
        <OnboardingNavigator />
      ) : signed ? (
        showPostLoginOnboarding ? ( // NOVO CHECK: Se estiver logado e não tiver completado o pós-login, mostra o PostLoginNavigator
          <PostLoginNavigator /> 
        ) : (
          <AppNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;