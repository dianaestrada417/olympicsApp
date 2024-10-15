import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LeaderBoardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the LeaderBoard Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50, // Adjust this to move the text lower or higher
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LeaderBoardScreen;
