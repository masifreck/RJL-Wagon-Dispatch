import {View, Text, StyleSheet, Image, StatusBar} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bgColor } from './constant';
const Splash = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
     
        
       
          navigation.navigate('MainScreen');
    
        
      } catch (error) {
        console.error('Error retrieving response:', error);
        // If there was an error in retrieving the response, navigate to Login screen
        navigation.navigate('Login');
      }
    };

    // Trigger checkLoginStatus after a delay of 3 seconds
    setTimeout(checkLoginStatus, 3000);
  }, [navigation]);

 
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.upper}>
        <View>
          <Text style={styles.company_name}>RJL WAGON DISPATCH </Text>
        </View>
      </View>
      <View style={styles.lower}>
        <Text style={styles.tranzol}>Powered By Tranzol</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
    paddingTop: StatusBar.currentHeight,
  },

  upper: {
    flex: 25,
    marginTop: '10%',
    marginHorizontal: '5%',
    backgroundColor: bgColor,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  lower: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  company_name: {
    fontFamily: 'PoppinsExtraBold',
    color: '#eeeeee',
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: 5,
  },

  tranzol: {
    fontSize: 10,
    position: 'absolute',
    bottom: 30,
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: 'PoppinsExtraBold',
    color: '#eeeeee',
  },
});

export default Splash;
