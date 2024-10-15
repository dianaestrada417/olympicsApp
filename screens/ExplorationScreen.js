import React, { useState, useEffect } from 'react'; // Ensure hooks are imported
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker'; // Import camera picker
import MapView, { Marker } from 'react-native-maps';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure your Firebase is set up

const ExplorationScreen = ({ navigation }) => {
  const [greenPoints, setGreenPoints] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [culturalCenters, setCulturalCenters] = useState([]);

  // Load Cultural Centers from Firebase or your data source
  useEffect(() => {
    const fetchCulturalCenters = async () => {
      const centersCollection = collection(db, 'culturalCenters');
      const centersSnapshot = await getDocs(centersCollection);
      const centersList = centersSnapshot.docs.map(doc => doc.data());
      setCulturalCenters(centersList);
    };

    fetchCulturalCenters();
  }, []);

  // Challenges available multiple times (recycling, public transport, etc.)
  const multipleChallenges = [
    { id: 'public_transport', name: 'Use Public Transportation' },
    { id: 'ev', name: 'Hop on an EV' },
    { id: 'walk', name: 'Go for a 10 Min Walk' },
    { id: 'recycle', name: 'Recycling' },
    { id: 'compost', name: 'Using Green Compost Bin' }
  ];

  const completeChallengeWithPhoto = async (challenge) => {
    let result = await launchCamera({ mediaType: 'photo' });
    if (result.assets) {
      Alert.alert("Challenge Completed!", `You earned green points for completing: ${challenge.name}`);
      setGreenPoints(greenPoints + 10); // Assuming 10 points per challenge
    }
  };

  // Handle map location challenges (centers and venues)
  const completeMapChallenge = async (center) => {
    if (completedChallenges.includes(center.id)) {
      Alert.alert("Already Completed", "You've already visited this location.");
      return;
    }

    Alert.alert("Challenge Completed!", `You earned green points for visiting: ${center.name}`);
    setGreenPoints(greenPoints + 50); // Assuming 50 points per location visit
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
      <MapView style={styles.map}>
        {culturalCenters.map((center) => (
          <Marker
            key={center.id}
            coordinate={{
              latitude: center.latitude,
              longitude: center.longitude
            }}
            title={center.name}
            description={center.org_name}
            onPress={() => completeMapChallenge(center)}
          />
        ))}
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
