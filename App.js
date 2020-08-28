import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppearanceProvider } from 'react-native-appearance';
import Spell from './src/Spell';
import Spells from './src/Spells';

export default function App() {
  const Stack = createStackNavigator();

  return (
    <AppearanceProvider>
      <StatusBar style="auto" />
      <NavigationContainer them={DefaultTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Spells"
            component={Spells}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Spell"
            component={Spell}
            options={({ route }) => ({ title: route.params.name })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppearanceProvider>
  );
}
