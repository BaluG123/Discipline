// screens/SplashScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/tomato-logo.jpg')} 
          style={styles.logo}
        />
        <Text style={styles.appName}>PomodoFocus</Text>
      </View>
      <LottieView
        source={require('../assets/loading-animation.json')}
        autoPlay
        loop
        style={styles.loadingAnimation}
      />
      <Text style={styles.tagline}>Boost your productivity with timed focus sessions</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    position: 'absolute',
    bottom: 60,
  },
});

export default SplashScreen;