// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const HomeScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Welcome to the Home Page</Text>
//       <Text style={styles.subText}>Welcome to Los Angeles, a dynamic city known for its rich culture, diverse communities, and vibrant energy. As we prepare to host the 2028 Olympic Games, our app is designed to be your ultimate companion, offering immersive AR experiences, exploration tools, and a community forum to connect with locals and fellow visitors. We are committed to making LA more accessible for all by helping close the digital divide, ensuring that everyone—regardless of background—can fully participate in the Olympic excitement and explore the city with ease​</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     paddingTop: 20,
//     backgroundColor: '#fff',
//   },
//   text: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   subText: {
//     fontSize: 18,
//     color: '#808080'
//   }
// });

// export default HomeScreen;


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image'; 

const HomeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image style={styles.gif} source={require('../assets/olympics2.gif')} contentFit="contain" />
        <Text style={styles.text}>Welcome to the Home Page</Text>
        <Text style={styles.subText}>
          Welcome to Los Angeles, a dynamic city known for its rich culture, diverse communities, and vibrant energy. As we prepare to host the 2028 Olympic Games, our app is designed to be your ultimate companion, offering immersive AR experiences, exploration tools, and a community forum to connect with locals and fellow visitors. We are committed to making LA more accessible for all by helping close the digital divide, ensuring that everyone—regardless of background—can fully participate in the Olympic excitement and explore the city with ease.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  gif: {
    width: 200,
    height: 200
  },
  text: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  subText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 10,
  },
});

export default HomeScreen;

