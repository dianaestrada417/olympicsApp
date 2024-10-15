// import React, {useState, useEffect, useRef, useCallback} from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, Dimensions, ActivityIndicator, TextInput, Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import Slider from '@react-native-community/slider';
// import * as Location from 'expo-location';
// import { NavigationContainer } from '@react-navigation/native';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Image } from 'expo-image';
// import { db } from './firebase';
// import {
//   collection,
//   addDoc,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
// } from 'firebase/firestore';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { GEMINI_API_KEY } from '@env';
// import { ImageBackground } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import ForumScreen from './screens/ForumScreen';

// const Stack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// function HomeScreen() {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [sports, setSports] = useState([]);
//   const [userType, setUserType] = useState(''); // 'New to LA' or 'LA Native'
//   const [country, setCountry] = useState(''); // Country if not LA native
//   const [showForm, setShowForm] = useState(false);

//   const scrollViewRef = useRef(null);

//   const handleScrollToForm = () => {
//     setShowForm(true);
//     setTimeout(() => {
//       scrollViewRef.current.scrollTo({ 
//         y: Dimensions.get('window').height, 
//         animated: true 
//       });
//     }, 100); // 100ms delay
//   };

//   const availableSports = [
//     "AQUATICS", "ARCHERY", "ATHLETICS", "BADMINTON", "BASEBALL",
//     "BASKETBALL", "CANOE", "CRICKET", "CYCLING", "EQUESTRIAN",
//     "FENCING", "FLAG FOOTBALL", "FOOTBALL (SOCCER)", "GOLF", "GYMNASTICS",
//     "HANDBALL", "HOCKEY", "JUDO", "LACROSSE", "MODERN PENTATHLON",
//     "ROWING", "RUGBY", "SAILING", "SHOOTING", "SKATEBOARDING",
//     "SOFTBALL", "SPORT CLIMBING", "SQUASH", "SURFING", "TABLE TENNIS",
//     "TAEKWONDO", "TENNIS", "TRIATHLON", "VOLLEYBALL", "WEIGHTLIFTING",
//     "WRESTLING"
//   ];

//   const handleSportSelect = (sport) => {
//     if (sports.includes(sport)) {
//       setSports(sports.filter(item => item !== sport)); // Deselect
//     } else {
//       setSports([...sports, sport]); // Select
//     }
//   };

//   const handleSubmit = async () => {
//     if (!firstName || !lastName || !userType) {
//       alert('Please fill in all fields.');
//       return;
//     }
    
//     const userData = {
//       firstName,
//       lastName,
//       sports,
//       userType,
//       country: userType === 'New to LA' ? country : null,
//     };

//     console.log("User Data Submitted:", userData);
//     try {
//       const docRef = await addDoc(collection(db, 'users'), userData);
//       console.log("Document written with ID: ", docRef.id);
        
//       // Clear the form
//       setFirstName('');
//       setLastName('');
//       setSports([]);
//       setUserType('');
//       setCountry('');
//       setShowForm(false);
      
//       // You might want to navigate to another screen or update the UI here
//     } catch (error) {
//       console.error("Error adding document: ", error);
//       alert('There was an error submitting your information. Please try again.');
//     }
//   };

//   return (
//     <ImageBackground
//     source={require('./assets/background.jpg')}  // Replace with your image path
//     style={styles.backgroundImage}
//     >
//     <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContainer}>
//       <Text style={styles.title}>Navigating the LA28 Olympics!</Text>
//       <Image
//         style={styles.gif}
//         source={require('./assets/olympics2.gif')}
//         contentFit="contain"
//       />

//       <TouchableOpacity style={styles.getStartedButton} onPress={handleScrollToForm}>
//         <Text style={styles.getStartedButtonText}>Get Started</Text>
//       </TouchableOpacity>

//       {showForm && (
//         <View style={styles.formContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="First Name"
//             value={firstName}
//             onChangeText={setFirstName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Last Name"
//             value={lastName}
//             onChangeText={setLastName}
//           />

//           <View style={styles.userTypeContainer}>
//             <TouchableOpacity
//               style={[styles.userTypeButton, userType === 'New to LA' && styles.selectedButton]}
//               onPress={() => setUserType('New to LA')}
//             >
//               <Text style={styles.buttonText}>New to LA</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.userTypeButton, userType === 'LA Native' && styles.selectedButton]}
//               onPress={() => setUserType('LA Native')}
//             >
//               <Text style={styles.buttonText}>LA Native</Text>
//             </TouchableOpacity>
//           </View>

//           {userType === 'New to LA' && (
//             <TextInput
//               style={styles.input}
//               placeholder="Country"
//               value={country}
//               onChangeText={setCountry}
//             />
//           )}

//           <Text style={styles.sportsTitle}>Select Sports:</Text>
//           {/* Add your sports selection UI here */}
//           <View style={styles.sportsContainer}>
//             {availableSports.map(sport => (
//               <TouchableOpacity
//                 key={sport}
//                 style={[styles.sportButton, sports.includes(sport) && styles.selectedSport]}
//                 onPress={() => handleSportSelect(sport)}
//               >
//                 <Text style={styles.sportButtonText}>{sport}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>


//           <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//             <Text style={styles.submitButtonText}>Submit</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//     </ImageBackground>
//   );
// }

// // Page 2 Component
// function MapScreen() {
//   return (
//     <View style={styles.container}>
//       <Text>Explore how the Olympics have shaped Los Angeles!</Text>
//     </View>
//   );
// }


// export default function App() {
//   return (
//     <NavigationContainer>
//       <Drawer.Navigator initialRouteName="Home">
//         <Drawer.Screen name="Home" component={HomeScreen} />
//         <Drawer.Screen name="Interactive Map" component={MapScreen} />
//         <Drawer.Screen name="Forum" component={ForumScreen} />
//       </Drawer.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f3fbfb',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   warningText: {
//     color: '#FFA500',
//   },
//   moderationText: {
//     color: 'red',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   containerOuter: {
//     flex: 1,
//     backgroundColor: '#f3fbfb',
//     width: '100%',
//   },
//   scrollContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   date: {
//     color: '#808080',
//     textAlign: 'right',
//   },
//   userHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   replyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   replyUserInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   replyUserLabel: {
//     paddingVertical: 3,
//     paddingHorizontal: 8,
//     borderRadius: 3,
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginRight: 5,
//   },
//   replyUserName: {
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   replyDate: {
//     color: '#808080',
//     fontSize: 11,
//   },
//   postInputContainer: {
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     width: '90%',
//     marginVertical: 10,
//     alignSelf: 'center',
//   },
//   input: {
//     width: '100%',
//     padding: 10,
//     marginVertical: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//   },
//   replyInput: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   userTypeContainer: {
//     flexDirection: 'row',
//     marginVertical: 20,
//     justifyContent: 'space-around',
//     width: '100%',
//   },
//   userTypeButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   selectedButton: {
//     backgroundColor: '#97f0d8',
//   },
//   buttonText: {
//     color: '#000',
//   },
//   submitButton: {
//     backgroundColor: '#2196f3',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginLeft: 5,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   postContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     marginVertical: 10,
//     borderRadius: 5,
//     width: '90%',
//     alignSelf: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   userLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   userLabel: {
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//     color: '#fff',
//     fontWeight: 'bold',
//     marginRight: 5,
//   },
//   newToLA: {
//     backgroundColor: '#4caf50', // Green label for "New to LA"
//   },
//   laNative: {
//     backgroundColor: '#003366', // Dark blue label for "LA Native"
//   },
//   userName: {
//     fontWeight: 'bold',
//   },
//   postText: {
//     marginTop: 5,
//     fontSize: 16,
//   },
//   replyContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 10,
//     marginVertical: 5,
//     marginLeft: 20,
//     borderRadius: 5,
//   },
//   replyText: {
//     fontSize: 14,
//   },
//   gif: {
//     width: 200,
//     height: 200,
//   },
//   replyInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginVertical: 10,
//     alignSelf: 'center',
//   },
//   replyButton: {
//     backgroundColor: '#2196f3',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//   },
//   replyButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   headerContainer: {
//     width: '90%',
//     padding: 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginVertical: 15,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#003366',
//     textAlign: 'center',
//   },
//   headerText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   sportsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     marginVertical: 10,
//   },
//   sportButton: {
//     padding: 10,
//     margin: 5,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 5,
//   },
//   selectedSport: {
//     backgroundColor: '#97f0d8',
//   },
//   sportButtonText: {
//     color: '#000',
//   },  
//   scrollViewContainer: {
//     flexGrow: 1,
//     marginTop: '50%',
//     minHeight: Dimensions.get('window').height * 2.3,
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   item: {
//     marginBottom: 20,
//     padding: 20,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     width: '100%', // or any other width you prefer
//   },
//   getStartedButton: {
//     backgroundColor: '#2196f3',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 5,
//     marginTop: 20,
//     alignSelf: 'center',
//   },
//   getStartedButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   title: {
//     // fontSize: 24,
//     marginBottom: 20,
//     color: '#fff'
//   },
//   formContainer: {
//     width: '90%',
//     alignItems: 'center',
//     marginTop: Dimensions.get('window').height /2,
//     backgroundColor: '#ffffff', // Add a background color
//     padding: 20, // Add some padding
//     borderRadius: 10, // Round the corners
//     // Add shadow properties
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   sportsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   backgroundImage: {
//     flex: 1,
//     resizeMode: 'cover', // or 'stretch'
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(255,255,255,0.7)', // semi-transparent white
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import React, { useState, useContext, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import ForumScreen from './screens/ForumScreen';
import ExplorationScreen from './screens/ExplorationScreen';
import ARScreen from './screens/ARScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const UserContext = createContext();

const MainDrawer = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Forum" component={ForumScreen} />
    <Drawer.Screen name="AR" component={ARScreen} />
    <Drawer.Screen name="Exploration" component={ExplorationScreen} />
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