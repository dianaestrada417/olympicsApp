import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { db } from '../firebase'; // Ensure this path is correct
import { collection, onSnapshot } from 'firebase/firestore';

const LeaderBoard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => { // Use collection function
      const userList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Include doc ID if needed
      }));
      // Sort users by greenPoints in descending order
      const sortedUsers = userList.sort((a, b) => b.greenPoints - a.greenPoints);
      setUsers(sortedUsers);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleRedeemPoints = () => {
    console.log("Redeem Points button clicked!");
    // Here you can add any additional logic for redeeming points if necessary
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>GreenPoints LeaderBoard🏆</Text>
        <Text style={styles.headerText}>
          Earn points by exploring and completing eco-friendly challenges throughout Los Angeles{"\n"}
        </Text>
      </View>
      <Button title="Redeem Points" onPress={handleRedeemPoints} />
        <Text style={styles.subText}>
          Get coupons to small businesses in the LA area!
        </Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id} // Ensure each item has a unique key
        renderItem={({ item, index }) => (
          <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <Text style={styles.text}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.text}>{item.greenPoints} points</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 16,
  },
  evenRow: {
    backgroundColor: '#c7f6b6', // Light blue background for even rows
  },
  oddRow: {
    backgroundColor: '#fff', // White background for odd rows
  },
  headerContainer: {
    width: '100%',
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

  subText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LeaderBoard;