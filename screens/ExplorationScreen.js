import React, { useState, useEffect } from 'react'; 
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker'; // Import camera picker
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios'; 
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;

const ExplorationScreen = ({ navigation }) => {
  const [greenPoints, setGreenPoints] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [cultureCenters, setCultureCenters] = useState([]);

  // Load Cultural Centers from Firebase or your data source
  useEffect(() => {
    const fetchCultureCenters = async () => {
      const centersCollection = collection(db, 'cultureCenters');
      const centersSnapshot = await getDocs(centersCollection);
      const centersList = centersSnapshot.docs.map(doc => doc.data());
      // Get the geolocation for each address using Google Maps API
      const centersWithGeolocation = await Promise.all(
        centersList.map(async (center) => {
          const geoLocation = await getGeolocation(center.Address);
          return { ...center, ...geoLocation }; // Merge geolocation into the center object
        })
      );
      
      setCultureCenters(centersWithGeolocation);
    };

    fetchCultureCenters();
  }, []);

    // Function to get geolocation from Google Maps API using an address
    const getGeolocation = async (address) => {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      }
      return { latitude: null, longitude: null }; // If geocoding fails, return null coordinates
    };

  // Challenges available multiple times (recycling, public transport, etc.)
  const multipleChallenges = [
    { id: 'public_transport', name: 'Use Public Transportation' },
    { id: 'ev', name: 'Hop on an EV' },
    { id: 'walk', name: 'Go for a 10 Min Walk' },
    { id: 'recycle', name: 'Recycling' },
    { id: 'compost', name: 'Using Green Compost Bin' },
    { id: 'bike', name: 'Use a metro bike' },
    { id: 'culture_visit', name: 'Visit one of our recommended culture sites' },
    { id: 'venue_visit', name: 'Explore an Olympic venue with AR' },
    { id: 'support_small_bussiness', name: 'Support one of our recommended small businesses' },
  ];

  const completeChallengeWithPhoto = async (challenge) => {
    if (challenge.id === 'venue_visit') {
      // Navigate to ARScreen if the 'venue_visit' challenge is clicked
      navigation.navigate('ARScreen'); // **RED: Add this line to navigate to ARScreen**
    } else {
      // Otherwise, handle the other challenges as usual
      let result = await launchCamera({ mediaType: 'photo' });
      if (result.assets) {
        Alert.alert("Challenge Completed!", `You earned green points for completing: ${challenge.name}`);
        setGreenPoints(greenPoints + 10); // Assuming 10 points per challenge
      }
    }
  };  

  // Handle map location challenges (centers and venues)
  const completeMapChallenge = async (center) => {
    if (completedChallenges.includes(center.id)) {
      Alert.alert("Already Completed", "You've already visited this location.");
      return;
    }

    Alert.alert("Challenge Completed!", `You earned green points for visiting: ${center.name}`);
    setGreenPoints(greenPoints + 1); // Assuming 50 points per location visit
    setCompletedChallenges([...completedChallenges, center.id]);

    // Save completed challenge to Firebase
    await addDoc(collection(db, 'completedChallenges'), {
      userId: 'currentUserId', // Replace with actual user ID
      challengeId: center.id
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Explore LA and Complete Challenges!</Text>

      {/* List of multiple-time challenges */}
      <Text style={styles.sectionTitle}>Sustainable Challenges</Text>
      {multipleChallenges.map((challenge) => (
        <TouchableOpacity
          key={challenge.id}
          style={styles.challengeButton}
          onPress={() => completeChallengeWithPhoto(challenge)}
        >
          <Text style={styles.challengeText}>{challenge.name}</Text>
        </TouchableOpacity>
      ))}

      {/* Map for cultural centers and LA28 sports venues */}
      <Text style={styles.sectionTitle}>Explore LA28 Sports Venues and Cultural Centers</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 34.0522, // Default center (Los Angeles)
          longitude: -118.2437,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {cultureCenters.map((center, index) => {
          if (center.latitude && center.longitude) {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: center.latitude,
                  longitude: center.longitude,
                }}
                title={center.name}
              >
                <Callout onPress={() => completeMapChallenge(center)}>
                  <View>
                    <Text style={styles.calloutTitle}>{center.name}</Text>
                    <Text>{center.Description}</Text>
                    {center.URL && (
                      <Text style={{ color: 'blue' }} onPress={() => Alert.alert('URL', center.URL)}>
                        Visit: {center.URL}
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>

      <Text style={styles.pointsText}>Your Green Points: {greenPoints}</Text>

      {/* Button to go to leaderboard */}
      <TouchableOpacity
        style={styles.leaderboardButton}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.leaderboardText}>View Leaderboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  challengeButton: {
    padding: 15,
    backgroundColor: '#97f0d8',
    borderRadius: 5,
    marginVertical: 10,
  },
  challengeText: {
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  leaderboardButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 5,
  },
  leaderboardText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ExplorationScreen;
