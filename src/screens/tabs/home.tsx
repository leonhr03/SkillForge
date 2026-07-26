import 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import database from "@react-native-firebase/database"
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  tasks: string[];
}

function Home() {
  const insets = useSafeAreaInsets();
  const [yourHabits, setYourHabits] = useState<Habit[]>([])
  //const [dailyTasks, setDailyTasks] = useState([])

  useEffect(() => {
    const loadYourHabits = async() => {
      const stored: any = await AsyncStorage.getItem("myHabits")
      const parsed = stored ? JSON.parse(stored) : []
      setYourHabits(parsed)
    }

    loadYourHabits()
  }, []);

  const addNewHabit = async () => {
    try {
      await database()
        .app.database('https://skillforge-react-default-rtdb.europe-west1.firebasedatabase.app')
        .ref('/socialHabits')
        .push({
          title: "Morning Workout",
          description: "lorem ipsum akjlsdf jöakdhf ajödkhf ajködfn adsf",
          category: "fitness",
          tasks: [ "workout", "workout2" ]
        });
    } catch (e) {
      console.log("Error by saving data to Firebase:", e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>Welcome Back✌️</Text>

      <View style={styles.card}>
        <Text>Your Habits</Text>
        { yourHabits?.map(item => (
          <Text>{item.title}</Text>
        ))
        }
      </View>

      <View style={styles.card}>
        <Text>Daily Tasks</Text>
      </View>

      <View style={styles.card}>
        <Text>Add new habit</Text>
        <TouchableOpacity onPress={() => addNewHabit()}>
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
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

  card: {
    alignSelf: 'center',
    width: '95%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
  },
});

export default Home;
