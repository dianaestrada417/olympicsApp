import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function VenuesMap() {
  // Define the sports venues with their coordinates and names
  const venues = [
    {
      name: "1932 Pool in Exposition Park",
      latitude: 34.0141,
      longitude: -118.2873,
    },
    {
      name: "1932 Pool in Exposition Park",
      latitude: 34.0141,
      longitude: -118.2873, // Same location as above
    },
    {
      name: "Arena (Inglewood, CA)",
      latitude: 33.9584,
      longitude: -118.3416,
    },
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 34.0522,  // Centered on Los Angeles
          longitude: -118.2437,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Loop through each venue to add markers */}
        {venues.map((venue, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
            title={venue.name}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});