import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/core';

interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  tasks: string[];
}

export default function Explore() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [seeDetails, setSeeDetails] = useState(false);
  const [itemDetails, setItemDetails] = useState<Habit>();
  const [socialHabits, setSocialHabits] = useState<Habit[]>([]);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [items, setItems] = useState([
    { label: 'All', value: '' },
    { label: 'Health', value: 'health' },
    { label: 'Fitness', value: 'fitness' },
    { label: 'Learning', value: 'learning' },
    { label: 'Productivity', value: 'productivity' },
    { label: 'Finance', value: 'finance' },
    { label: 'Personal Growth', value: 'personal_growth' },
    { label: 'Relationships', value: 'relationships' },
    { label: 'Creativity', value: 'creativity' },
    { label: 'Mindfulness', value: 'mindfulness' },
    { label: 'Lifestyle', value: 'lifestyle' },
    { label: 'Nutrition', value: 'nutrition' },
    { label: 'Career', value: 'career' },
    { label: 'Self Care', value: 'self_care' },
    { label: 'Organization', value: 'organization' },
    { label: 'Social Life', value: 'social_life' },
    { label: 'Time Management', value: 'time_management' },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      const loadHabits = async () => {
        const snapshot = await database().ref('/socialHabits').once('value');

        const data = snapshot.val();

        console.log(data)

        const habitsArray = Object.keys(data)
          .filter(key => data[key].title)
          .map(key => ({
            id: key,
            ...data[key],
          }));
        setSocialHabits(habitsArray);
      };

      loadHabits();
    }, [])
  )

  useEffect(() => {
    if (value === '') {
      setFilteredHabits(socialHabits);
    } else {
      setFilteredHabits(socialHabits.filter(habit => habit.category === value));
    }
  }, [value, socialHabits]);

  const addHabitToOwn = async() => {
    const stored : any = await AsyncStorage.getItem("myHabits")
    const parsed = stored ? JSON.parse(stored) : []

    const newMyHabits: Habit[] = [itemDetails, ...parsed]

    await AsyncStorage.setItem("myHabits", JSON.stringify(newMyHabits))
  }

  const socialHabitItem = ({ item }: any) => {
    return (
      <View style={[styles.card, styles.habitItemInner]}>
        <Text style={styles.habitItemText} numberOfLines={1}>
          {item.title}
        </Text>

        <TouchableOpacity
          style={styles.habitItemButton}
          onPress={() => {
            setItemDetails(item);
            setSeeDetails(true);
          }}>
          <Text style={styles.habitItemButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>Find new habits</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={styles.picker}
      />
      <FlatList
        data={filteredHabits}
        renderItem={socialHabitItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 80,
        }}
      />

      <Modal transparent animationType={'slide'} visible={seeDetails}>
        <Pressable style={styles.modalContainer} onPress={() => setSeeDetails(false)}>
          <Pressable style={styles.habitDetailModal} onPress={() => {}}>
            <Text style={styles.heading}>{itemDetails?.title}</Text>
            <View style={styles.card}>
              <Text>{itemDetails?.description}</Text>
            </View>
            <Text style={styles.heading}>Tasks</Text>
            { itemDetails?.tasks.map((task) => (
              <View style={styles.card}>
                <Text>{task}</Text>
              </View>
              ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addHabitToOwn()}>
              <Text>Add</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    borderRadius: 10,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
  },

  picker: {
    borderRadius: 10,
  },

  habitItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },

  habitItemText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 10,
  },

  habitItemButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  habitItemButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  habitDetailModal: {
    height: '50%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
  },

  addButton: {
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    alignSelf: "center",
    width: "50%",
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
  },
});
