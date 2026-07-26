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
import { useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    const loadHabits = async () => {
      const snapshot = await database().ref('/socialHabits').once('value');

      const data = snapshot.val();

      const habitsArray = Object.keys(data)
        .filter(key => data[key].title)
        .map(key => ({
          id: key,
          ...data[key],
        }));
      setSocialHabits(habitsArray);
    };

    loadHabits();
  }, []);

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
        <Text style={styles.habitItemText}>{item.title}</Text>
        <TouchableOpacity
          style={styles.habitItemButton}
          onPress={() => {setSeeDetails(true), setItemDetails(item)}}
        >
          <Text style={styles.habitItemButtonText}>details</Text>
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
    borderRadius: 12,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
  },

  habitItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  picker: {
    borderRadius: 15,
  },

  habitItemText: {
    fontSize: 20,
  },

  habitItemButton: {
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    position: 'absolute',
    right: 10,
  },

  habitItemButtonText: {
    color: '#fff',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  habitDetailModal: {
    height: '50%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
  },

  addButton: {
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 15,
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
