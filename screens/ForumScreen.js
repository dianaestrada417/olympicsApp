import { StyleSheet, Text, View, Dimensions, ActivityIndicator, TextInput, Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import { db } from '../firebase';
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
import { useUserData } from '../App';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

const ForumScreen = ({route}) => {
    const {userData} = useUserData();
    const [post, setPost] = useState('');
    const [posts, setPosts] = useState([]);
    const [replies, setReplies] = useState({});
    const inputRef = useRef();
    const [moderationReason, setModerationReason] = useState('');
  
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
      if (userData && post) {
        try {
          const moderation = await moderateContent(post);
          if (!moderation.isApproved) {
            setModerationReason(moderation.reason); // Set the moderation reason
            setTimeout(() => setModerationReason(''), 5000); // Clear after 5 seconds
            return;
          }
  
          await addDoc(collection(db, 'forumPosts'), {
            userType: userData.userType,
            firstName: userData.firstName,
            lastName: userData.lastName,
            post,
            replies: [],
            createdAt: new Date(),
          });
          setPost('');
          fetchPosts();
        } catch (error) {
          console.error('Error adding post: ', error);
        }
      }
    }, [userData, post, fetchPosts]);
  
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
                firstName: userData.firstName,
                lastName: userData.lastName,
                userType: userData.userType,
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
      [replies, userData, fetchPosts]
    );
  
    useEffect(() => {
      fetchPosts();
    }, [fetchPosts]);
  
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

export default ForumScreen;