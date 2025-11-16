import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingSlidesScreen } from '../screens/OnboardingSlidesScreen';

export type OnboardingStackParamList = {
  OnboardingSlides: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OnboardingSlides" component={OnboardingSlidesScreen} />
  </Stack.Navigator>
);