import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

//Page 1 Component
function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home Page - LA28 Olympics!</Text>
    </View>
  );
}

// Page 2 Component
function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text>Events Page - Check out the upcoming events!</Text>
    </View>
  );
}

// Page 3 Component
function AthletesScreen() {
  return (
    <View style={styles.container}>
      <Text>Athletes Page - Meet the participants!</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Events" component={EventsScreen} />
        <Drawer.Screen name="Athletes" component={AthletesScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
