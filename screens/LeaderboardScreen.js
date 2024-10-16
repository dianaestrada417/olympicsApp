import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.container}>
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
    backgroundColor: '#e6f7ff', // Light blue background for even rows
  },
  oddRow: {
    backgroundColor: '#fff', // White background for odd rows
  },
});

export default LeaderBoard;