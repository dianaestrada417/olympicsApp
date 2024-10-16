import React, { useState, useContext, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import ForumScreen from './screens/ForumScreen';
import ExplorationScreen from './screens/ExplorationScreen';
import ARScreen from './screens/ARScreen';
import LeaderBoard from './screens/LeaderBoardScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const UserContext = createContext();

const MainDrawer = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Forum" component={ForumScreen} />
    <Drawer.Screen name="AR" component={ARScreen} />
    <Drawer.Screen name="Exploration" component={ExplorationScreen} />
    <Drawer.Screen name="Leaderboard" component={LeaderBoard} />
  </Drawer.Navigator>
);

export default function App() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [userData, setUserData] = useState(null);

  return (
  <NavigationContainer>
    <UserContext.Provider value={{ userData, setUserData }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!formSubmitted ? (
          <Stack.Screen name="SignUp">
            {props => (
              <SignUpScreen
                {...props}
                setFormSubmitted={setFormSubmitted}
                setUserData={setUserData}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainApp" component={MainDrawer} />
        )}
      </Stack.Navigator>
    </UserContext.Provider>
  </NavigationContainer>
  );
}

export const useUserData = () => useContext(UserContext);