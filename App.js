import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { BranchProvider } from './src/context/BranchContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.white,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.white} />
      <AuthProvider>
        <BranchProvider>
          <NavigationContainer theme={appTheme}>
            <RootNavigator />
          </NavigationContainer>
        </BranchProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
