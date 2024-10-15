import React, { useState, useRef } from 'react';
import { Text, View, Dimensions, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ImageBackground } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import db correctly

const HomeScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [sports, setSports] = useState([]);
    const [userType, setUserType] = useState('');
    const [country, setCountry] = useState('');
    const [showForm, setShowForm] = useState(false);
    
    const scrollViewRef = useRef(null);
  
    const handleScrollToForm = () => {
      setShowForm(true);
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: Dimensions.get('window').height,
          animated: true
        });
      }, 100);
    };

    const availableSports = [
        "AQUATICS", "ARCHERY", "ATHLETICS", "BADMINTON", "BASEBALL",
        "BASKETBALL", "CANOE", "CRICKET", "CYCLING", "EQUESTRIAN",
        "FENCING", "FLAG FOOTBALL", "FOOTBALL (SOCCER)", "GOLF", "GYMNASTICS",
        "HANDBALL", "HOCKEY", "JUDO", "LACROSSE", "MODERN PENTATHLON",
        "ROWING", "RUGBY", "SAILING", "SHOOTING", "SKATEBOARDING",
        "SOFTBALL", "SPORT CLIMBING", "SQUASH", "SURFING", "TABLE TENNIS",
        "TAEKWONDO", "TENNIS", "TRIATHLON", "VOLLEYBALL", "WEIGHTLIFTING",
        "WRESTLING"
    ];

    const handleSportSelect = (sport) => {
    if (sports.includes(sport)) {
        setSports(sports.filter(item => item !== sport)); // Deselect
    } else {
        setSports([...sports, sport]); // Select
    }
    };
  
    const handleSubmit = async () => {
      if (!firstName || !lastName || !userType) {
        alert('Please fill in all fields.');
        return;
      }
  
      const userData = {
        firstName,
        lastName,
        sports,
        userType,
        country: userType === 'New to LA' ? country : null,
      };
  
      try {
        await addDoc(collection(db, 'users'), userData);
        setFirstName('');
        setLastName('');
        setSports([]);
        setUserType('');
        setCountry('');
        setShowForm(false);
  
        // Navigate to the Forum screen and pass the user data
        navigation.navigate('Forum', { userData });
      } catch (error) {
        alert('Error submitting your information. Please try again.');
      }
    };
  
    return (
      <ImageBackground source={require('../assets/background.jpg')} style={styles.backgroundImage}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContainer}>
          <Text style={styles.title}>Navigating the LA28 Olympics!</Text>
          <Image style={styles.gif} source={require('../assets/olympics2.gif')} contentFit="contain" />
          <TouchableOpacity style={styles.getStartedButton} onPress={handleScrollToForm}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
  
          {showForm && (
            <View style={styles.formContainer}>
              <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
              <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
              {/* User type and sports selection UI */}
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                style={[styles.userTypeButton, userType === 'New to LA' && styles.selectedButton]}
                onPress={() => setUserType('New to LA')}
                >
                <Text style={styles.buttonText}>New to LA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.userTypeButton, userType === 'LA Native' && styles.selectedButton]}
                onPress={() => setUserType('LA Native')}
                >
                <Text style={styles.buttonText}>LA Native</Text>
                </TouchableOpacity>
            </View>

            {userType === 'New to LA' && (
                <TextInput
                style={styles.input}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
                />
            )}

            <Text style={styles.sportsTitle}>Select Sports:</Text>
            {/* Add your sports selection UI here */}
            <View style={styles.sportsContainer}>
                {availableSports.map(sport => (
                <TouchableOpacity
                    key={sport}
                    style={[styles.sportButton, sports.includes(sport) && styles.selectedSport]}
                    onPress={() => handleSportSelect(sport)}
                >
                    <Text style={styles.sportButtonText}>{sport}</Text>
                </TouchableOpacity>
                ))}
            </View>
      
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3fbfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    color: '#FFA500',
  },
  moderationText: {
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  containerOuter: {
    flex: 1,
    backgroundColor: '#f3fbfb',
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  date: {
    color: '#808080',
    textAlign: 'right',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  replyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyUserLabel: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  replyUserName: {
    fontWeight: '500',
    fontSize: 12,
  },
  replyDate: {
    color: '#808080',
    fontSize: 11,
  },
  postInputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    marginVertical: 10,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  replyInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  userTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#97f0d8',
  },
  buttonText: {
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userLabel: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  newToLA: {
    backgroundColor: '#4caf50', // Green label for "New to LA"
  },
  laNative: {
    backgroundColor: '#003366', // Dark blue label for "LA Native"
  },
  userName: {
    fontWeight: 'bold',
  },
  postText: {
    marginTop: 5,
    fontSize: 16,
  },
  replyContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    marginLeft: 20,
    borderRadius: 5,
  },
  replyText: {
    fontSize: 14,
  },
  gif: {
    width: 200,
    height: 200,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
    alignSelf: 'center',
  },
  replyButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003366',
    textAlign: 'center',
  },
  headerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'center',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  sportButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedSport: {
    backgroundColor: '#97f0d8',
  },
  sportButtonText: {
    color: '#000',
  },  
  scrollViewContainer: {
    flexGrow: 1,
    marginTop: '50%',
    minHeight: Dimensions.get('window').height * 2.3,
    alignItems: 'center',
    paddingVertical: 20,
  },
  item: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '100%', // or any other width you prefer
  },
  getStartedButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  getStartedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: {
    // fontSize: 24,
    marginBottom: 20,
    color: '#fff'
  },
  formContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height /2,
    backgroundColor: '#ffffff', // Add a background color
    padding: 20, // Add some padding
    borderRadius: 10, // Round the corners
    // Add shadow properties
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sportsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)', // semi-transparent white
    alignItems: 'center',
    justifyContent: 'center',
  },
});
  
  export default HomeScreen;