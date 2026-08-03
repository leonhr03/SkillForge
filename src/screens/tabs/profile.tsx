import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/core';
import React, { useState } from 'react';

export default function Profile({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        const uid = auth().currentUser?.uid;

        const userRef = await database().ref(`users/${uid}`);

        userRef.once('value').then(snapshot => {
          setUserData(snapshot.val());
        });
      };

      loadUserData();
    }, []),
  );

  const logOut = async () => {
    await auth().signOut();
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>{userData.username}</Text>
      <TouchableOpacity style={styles.logOutButton} onPress={() => logOut()}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    gap: 20,
    padding: 10,
  },

  heading: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },

  logOutButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
  },
});
