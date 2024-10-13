import React, {useState, useEffect, useRef, useCallback} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, ActivityIndicator, TextInput, Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image } from 'expo-image';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

const Drawer = createDrawerNavigator();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function HomeScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sports, setSports] = useState([]);
  const [userType, setUserType] = useState(''); // 'New to LA' or 'LA Native'
  const [country, setCountry] = useState(''); // Country if not LA native
  const [showForm, setShowForm] = useState(false);

  const scrollViewRef = useRef(null);

  const handleScrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      scrollViewRef.current.scrollTo({ 
        y: Dimensions.get('window').height, 
        animated: true 
      });
    }, 100); // 100ms delay
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

    console.log("User Data Submitted:", userData);
    try {
      const docRef = await addDoc(collection(db, 'users'), userData);
      console.log("Document written with ID: ", docRef.id);
        
      // Clear the form
      setFirstName('');
      setLastName('');
      setSports([]);
      setUserType('');
      setCountry('');
      setShowForm(false);
      
      // You might want to navigate to another screen or update the UI here
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('There was an error submitting your information. Please try again.');
    }
  };

  return (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContainer}>
      <Text style={styles.title}>Navigating the LA28 Olympics!</Text>
      <Image
        style={styles.gif}
        source={require('./assets/olympics.gif')}
        contentFit="contain"
      />

      <TouchableOpacity style={styles.getStartedButton} onPress={handleScrollToForm}>
        <Text style={styles.getStartedButtonText}>Get Started</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

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
  );
}

// Page 2 Component
function MapScreen() {
  return (
    <View style={styles.container}>
      <Text>Explore how the Olympics have shaped Los Angeles!</Text>
    </View>
  );
}

async function moderateContent(content) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Please analyze this content for appropriateness in a community forum about the LA28 Olympics. 
      Consider if it contains:
      1. Inappropriate language
      2. Harmful content
      3. Spam
      
      Content to analyze: "${content}"
      
      Respond with only "APPROVED" or "REJECTED" followed by a brief reason.
      This should be the format of the response: "REJECTED - Inappropriate language"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("reSPonse: ", responseText)

    const [status, ...reasonParts] = responseText.split("\n");
    const reason = reasonParts.join(" ").trim() || "No reason provided";

    return {
      isApproved: status.includes("APPROVED"),
      reason: reason
      // isApproved: response.includes('APPROVED'),
      // reason: response.split('\n')[1] || 'No reason provided',
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    return { isApproved: true, reason: 'Moderation check failed' };
  }
}

// Separate Header Component
const ForumHeader = React.memo(({ handleAddPost, post, setPost, inputRef, moderationReason }) => (
  <>
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>LA28 Community Forum🏆</Text>
      <Text style={styles.headerText}>
        Share your unique perspective, ask questions, and contribute ideas about everything from getting around the city to enjoying events.{"\n"}
        Join the discussion!{"\n"}
      </Text>
      <Text style={styles.warningText}>⚠️AI Monitored</Text>
    </View>
    <View style={styles.postInputContainer}>
      <TouchableOpacity style={styles.submitButton} onPress={handleAddPost}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Enter your question..."
        value={post}
        onChangeText={setPost}
        multiline={true}
      />
      {moderationReason ? (
        <Text style={styles.moderationText}>{moderationReason}</Text>
      ) : null}
    </View>
  </>
));

function ForumScreen() {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    userType: '',
  });
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [isUserInfoSubmitted, setIsUserInfoSubmitted] = useState(false);
  const inputRef = useRef();
  const [moderationReason, setModerationReason] = useState('');

  const handleUserTypeSelection = (type) => {
    setUserInfo((prev) => ({ ...prev, userType: type }));
  };

  const handleUserInfoSubmit = () => {
    if (userInfo.firstName && userInfo.lastName && userInfo.userType) {
      setIsUserInfoSubmitted(true);
    } else {
      alert('Enter all fields before submitting');
    }
  };

  const fetchPosts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'forumPosts'));
      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
    } catch (error) {
      console.error('Error fetching posts: ', error);
    }
  }, []);

  const handleAddPost = useCallback(async () => {
    if (userInfo.userType && post) {
      try {
        const moderation = await moderateContent(post);
        if (!moderation.isApproved) {
          // alert(`Your post was not approved. Reason: ${moderation.reason}`);
          setModerationReason(moderation.reason); // Set the moderation reason
          setTimeout(() => setModerationReason(''), 5000); // Clear after 5 seconds
          return;
        }

        await addDoc(collection(db, 'forumPosts'), {
          userType: userInfo.userType,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          post,
          replies: [],
          createdAt: new Date(),
        });
        setPost('');
        fetchPosts(); // Fetch updated posts
      } catch (error) {
        console.error('Error adding post: ', error);
      }
    }
  }, [userInfo, post, fetchPosts]);

  const handleReplyChange = useCallback((postId, text) => {
    setReplies((prevReplies) => ({ ...prevReplies, [postId]: text }));
  }, []);

  const handleReplySubmit = useCallback(
    async (postId) => {
      const replyText = replies[postId];
      if (replyText) {
        try {
          const moderation = await moderateContent(replyText);
          if (!moderation.isApproved) {
            alert(`Your reply was not approved. Reason: ${moderation.reason}`);
            return;
          }

          const postRef = doc(db, 'forumPosts', postId);
          const postSnapshot = await getDoc(postRef);
          const postData = postSnapshot.data();

          const updatedReplies = [
            ...(postData.replies || []),
            {
              reply: replyText,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              userType: userInfo.userType,
              createdAt: new Date(),
            },
          ];

          await updateDoc(postRef, {
            replies: updatedReplies,
          });

          setReplies((prevReplies) => ({ ...prevReplies, [postId]: '' }));
          fetchPosts(); // Refresh posts after updating replies
        } catch (error) {
          console.error('Error submitting reply: ', error);
        }
      }
    },
    [replies, userInfo, fetchPosts]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!isUserInfoSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.signupContainer}>
          <Text>Join the forum!</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={userInfo.firstName}
            onChangeText={(text) =>
              setUserInfo((prev) => ({ ...prev, firstName: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={userInfo.lastName}
            onChangeText={(text) =>
              setUserInfo((prev) => ({ ...prev, lastName: text }))
            }
          />
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userInfo.userType === 'New to LA' && styles.selectedButton,
              ]}
              onPress={() => handleUserTypeSelection('New to LA')}
            >
              <Text style={styles.buttonText}>New to LA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userInfo.userType === 'LA Native' && styles.selectedButton,
              ]}
              onPress={() => handleUserTypeSelection('LA Native')}
            >
              <Text style={styles.buttonText}>LA Native</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleUserInfoSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <FlatList
        style={styles.scrollContainer}
        ListHeaderComponent={
          <ForumHeader
            handleAddPost={handleAddPost}
            post={post}
            setPost={setPost}
            inputRef={inputRef}
            moderationReason={moderationReason}
          />
        }
        data={posts}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <View style={styles.userHeader}>
              <View style={styles.userLabelContainer}>
                <Text
                  style={[
                    styles.userLabel,
                    item.userType === 'New to LA'
                      ? styles.newToLA
                      : styles.laNative,
                  ]}
                >
                  {item.userType}
                </Text>
                <Text style={styles.userName}>
                  {item.firstName} {item.lastName}
                </Text>
              </View>
              <View style={styles.postDateContainer}>
                <Text style={styles.date}>
                  {item.createdAt &&
                    item.createdAt.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                </Text>
              </View>
            </View>
            <Text style={styles.postText}>{item.post}</Text>

            {/* Display Replies */}
            <FlatList
              data={item.replies}
              keyExtractor={(reply, index) => index.toString()}
              renderItem={({ item: replyItem }) => (
                <View style={styles.replyContainer}>
                  <View style={styles.replyHeader}>
                    <View style={styles.replyUserInfo}>
                      <Text
                        style={[
                          styles.replyUserLabel,
                          replyItem.userType === 'New to LA'
                            ? styles.newToLA
                            : styles.laNative,
                        ]}
                      >
                        {replyItem.userType}
                      </Text>
                      <Text style={styles.replyUserName}>
                        {replyItem.firstName} {replyItem.lastName}
                      </Text>
                    </View>
                    <Text style={styles.replyDate}>
                      {replyItem.createdAt &&
                        new Date(replyItem.createdAt.toDate()).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                    </Text>
                  </View>
                  <Text style={styles.replyText}>{replyItem.reply}</Text>
                </View>
              )}
            />

            {/* Reply Input for this specific post */}
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Reply..."
                value={replies[item.id] || ''}
                onChangeText={(text) => handleReplyChange(item.id, text)}
              />
              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => handleReplySubmit(item.id)}
              >
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Interactive Map" component={MapScreen} />
        <Drawer.Screen name="Forum" component={ForumScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

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
  signupContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
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
});
