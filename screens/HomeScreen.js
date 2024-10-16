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
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image'; 

const HomeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.text}>GoLA28</Text>
          <Image style={styles.rings} source={require('../assets/rings_logo.png')} contentFit="contain" />
        </View>
        <Text style={styles.subText}>
          Welcome to Los Angeles, a dynamic city known for its rich culture, diverse communities, and vibrant energy. As we prepare to host the 2028 Olympic Games, our app is designed to be your ultimate companion, offering immersive AR experiences, exploration tools, and a community forum to connect with locals and fellow visitors. We are committed to making LA more accessible for all by helping close the digital divide, ensuring that everyone—regardless of background—can fully participate in the Olympic excitement and explore the city with ease.
        </Text>
        <Image 
          style={styles.gif} 
          source={{uri: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3JxMWcydG9pb3E1YjAzaW0xcHZuNml4cDFvb2lleWtmbnRmcGtlcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zamPOvT5y90rGS6sD8/giphy.gif'}} 
          contentFit="contain" />
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
    width: '90%',
    padding: 20,
    paddingBottom: 0,
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
  headerContainer: {
    flexDirection: 'row', // Aligns items in a row
    justifyContent: 'center',
    alignItems: 'center', // Vertically centers the text and image
    width: '100%',
  },
  gif: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  text: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 10,
  },
  rings: {
    width: 50,
    height: 50,
  },
});

export default HomeScreen;
