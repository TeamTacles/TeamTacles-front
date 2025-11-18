import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingSlidesScreen } from '../screens/OnboardingSlidesScreen';
import { PostLoginOnboardingScreen } from '../screens/PostLoginOnboardingScreen'; // Importação do novo componente

export type OnboardingStackParamList = {
  OnboardingSlides: undefined;
  PostLoginOnboarding: undefined; // NOVO TIPO DE TELA
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OnboardingSlides" component={OnboardingSlidesScreen} />
  </Stack.Navigator>
);

export const PostLoginNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PostLoginOnboarding" component={PostLoginOnboardingScreen} />
  </Stack.Navigator>
);