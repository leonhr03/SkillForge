import 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Progress from 'react-native-progress';
import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';
import auth from '@react-native-firebase/auth';

interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  tasks?: string[];
}

interface Todo {
  habitId: string;
  taskIndex: number;
  title: string;
  checked: boolean;
  lastReset: string;
}

function Home() {
  const insets = useSafeAreaInsets();
  const [yourHabits, setYourHabits] = useState<Habit[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Todo[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newTasks, setNewTasks] = useState<string[]>([]);
  const [newPublic, setNewPublic] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState('');
  const [categories, setCategories] = useState([
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
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [doneTasks, setDoneTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  const uid = auth().currentUser?.uid;

  const loadYourHabits = React.useCallback(async () => {
    if (!uid) return;

    const today = new Date().toISOString().split('T')[0];

    // 1. Habits aus Firebase Realtime Database laden
    const habitsSnapshot = await database().ref(`users/${uid}/habits`).once('value');
    const habitsData = habitsSnapshot.val();

    const loadedHabits: Habit[] = [];
    if (habitsData) {
      Object.keys(habitsData).forEach(key => {
        loadedHabits.push({
          id: key,
          ...habitsData[key],
        });
      });
    }

    setYourHabits(loadedHabits);

    // 2. Status der Daily Tasks aus der DB laden (users/${uid}/dailyTasks)
    const tasksSnapshot = await database().ref(`users/${uid}/dailyTasks`).once('value');
    const dbTasks: Record<string, Todo> = tasksSnapshot.val() || {};

    const allTasks: Todo[] = [];

    loadedHabits.forEach((habit: Habit) => {
      if (habit.tasks && Array.isArray(habit.tasks)) {
        habit.tasks.forEach((taskTitle: string, index: number) => {
          const taskKey = `${habit.id}_${index}`;
          const existing = dbTasks[taskKey];

          // Falls ein neues Datum angebrochen ist -> Reset
          const isChecked = existing && existing.lastReset === today ? existing.checked : false;

          allTasks.push({
            habitId: habit.id,
            taskIndex: index,
            title: taskTitle,
            checked: isChecked,
            lastReset: today,
          });
        });
      }
    });

    const done = allTasks.filter(todo => todo.checked).length;
    const total = allTasks.length;

    setDoneTasks(done);
    setTotalTasks(total);
    setTaskProgress(total > 0 ? done / total : 0);

    if (allTasks.length !== 0) {
      sendNotification().catch(err => console.log(err));
    }

    setDailyTasks(allTasks);
  }, [uid]);

  useFocusEffect(
    React.useCallback(() => {
      loadYourHabits();
    }, [loadYourHabits]),
  );

  const sendNotification = async () => {
    await notifee.cancelTriggerNotifications();
    const date = new Date();

    date.setHours(13);
    date.setMinutes(0);
    date.setSeconds(0);

    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    await notifee.createTriggerNotification(
      {
        title: 'SkillForge',
        body: 'Time to check your Tasks',
        android: {
          channelId: 'habit-reminders',
          smallIcon: 'ic_reminder',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  };

  const addNewHabit = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Title fehlt');
      return;
    }

    if (!uid) return;

    const habitPayload = {
      title: newTitle,
      description: newDescription,
      category: categoryValue || 'none',
      tasks: newTasks,
    };

    if (newPublic) {
      await database().ref('/socialHabits').push(habitPayload);
    }

    // Speichern unter `users/${uid}/habits` statt direkt unter `users/${uid}`
    await database().ref(`users/${uid}/habits`).push(habitPayload);

    // Reset Form Fields
    setNewTitle('');
    setNewDescription('');
    setNewTasks([]);
    setCategoryValue('');

    await loadYourHabits();
    setAddModal(false);
  };

  const checkTodo = async (targetTodo: Todo) => {
    if (!uid) return;

    const today = new Date().toISOString().split('T')[0];
    const newCheckedState = !targetTodo.checked;
    const taskKey = `${targetTodo.habitId}_${targetTodo.taskIndex}`;

    // 1. Direkt in Firebase aktualisieren
    await database().ref(`users/${uid}/dailyTasks/${taskKey}`).set({
      title: targetTodo.title,
      checked: newCheckedState,
      lastReset: today,
    });

    // 2. Lokalen State anpassen
    const updatedTasks = dailyTasks.map(todo =>
      todo.habitId === targetTodo.habitId && todo.taskIndex === targetTodo.taskIndex
        ? { ...todo, checked: newCheckedState, lastReset: today }
        : todo,
    );

    const newDoneTasks = updatedTasks.filter(todo => todo.checked).length;
    const newTotalTasks = updatedTasks.length;
    const progress = newTotalTasks > 0 ? newDoneTasks / newTotalTasks : 0;

    setTaskProgress(progress);
    setDoneTasks(newDoneTasks);
    setTotalTasks(newTotalTasks);
    setDailyTasks(updatedTasks);
  };

  const addTask = () => {
    if (newTask.trim() === '') return;
    setNewTasks([...newTasks, newTask]);
    setNewTask('');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: 80 },
      ]}
    >
      <Text style={styles.heading}>Welcome Back✌️</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {doneTasks}/{totalTasks} tasks checked
        </Text>
        <View style={styles.progressContainer}>
          <Progress.Bar progress={taskProgress ?? 0} width={null} height={12} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Habits</Text>
        {yourHabits?.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Tasks</Text>
        {dailyTasks?.map((item, index) => (
          <View key={`${item.habitId}_${index}`} style={[styles.card, styles.taskItemInner]}>
            <Text>{item.title}</Text>
            <TouchableOpacity
              style={styles.taskItemButton}
              onPress={() => checkTodo(item)}
            >
              <Text style={styles.taskItemButtonText}>
                {item.checked ? 'Erledigt' : 'Ausstehend'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={[styles.card, styles.taskItemInner]}>
        <Text style={styles.cardTitle}>Add new habit</Text>
        <TouchableOpacity
          style={styles.openAddAlertButton}
          onPress={() => setAddModal(true)}
        >
          <Text style={styles.openAddAlertButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent animationType={'slide'} visible={addModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={() => setAddModal(false)}
        >
          <Pressable style={styles.addHabitContainer} onPress={() => {}}>
            <Text style={styles.heading}>Add new Habit</Text>

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Title"
              placeholderTextColor={'#777'}
              style={styles.addHabitInput}
            />

            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description"
              placeholderTextColor={'#777'}
              multiline
              style={[styles.addHabitInput, styles.descriptionInput]}
            />

            <View style={styles.row}>
              <TouchableOpacity
                style={
                  newPublic ? styles.publicButton : styles.uncurrentPublicButton
                }
                onPress={() => setNewPublic(true)}
              >
                <Text
                  style={
                    newPublic
                      ? styles.publicButtonTextWhite
                      : styles.publicButtonTextBlack
                  }
                >
                  Public
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  newPublic ? styles.uncurrentPublicButton : styles.publicButton
                }
                onPress={() => setNewPublic(false)}
              >
                <Text
                  style={
                    newPublic
                      ? styles.publicButtonTextBlack
                      : styles.publicButtonTextWhite
                  }
                >
                  Unpublic
                </Text>
              </TouchableOpacity>
            </View>

            <DropDownPicker
              open={categoryOpen}
              value={categoryValue}
              items={categories}
              setOpen={setCategoryOpen}
              setValue={setCategoryValue}
              setItems={setCategories}
              placeholder="Choose category"
              style={styles.categoryPicker}
              dropDownContainerStyle={styles.categoryDropdown}
            />

            <View style={styles.taskInputContainer}>
              <TextInput
                value={newTask}
                onChangeText={setNewTask}
                placeholder="Add Task"
                placeholderTextColor={'#777'}
                style={styles.taskInput}
              />

              <TouchableOpacity style={styles.taskAddButton} onPress={addTask}>
                <Text style={styles.taskAddButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.taskList}>
                {newTasks.map((task, index) => (
                  <View key={index} style={styles.taskPreview}>
                    <Text>{task}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addNewHabit()}
            >
              <Text style={styles.addButtonText}>Add Habit</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    gap: 10,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },

  taskItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  taskItemButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  taskItemButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  openAddAlertButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  openAddAlertButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  addHabitContainer: {
    height: '75%',
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
    alignSelf: 'center',
    width: '50%',
    alignItems: 'center',
  },

  addButtonText: {
    color: '#fff',
  },

  addHabitInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center',
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  categoryPicker: {
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center',
    borderColor: '#000',
  },

  categoryDropdown: {
    width: '95%',
    alignSelf: 'center',
    borderColor: '#000',
  },

  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    alignSelf: 'center',
    gap: 8,
  },

  taskInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },

  taskAddButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskAddButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  taskList: {
    width: '95%',
    alignSelf: 'center',
    gap: 5,
  },

  taskPreview: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
  },

  progressContainer: {
    width: '95%',
    alignSelf: 'center',
  },

  row: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },

  publicButton: {
    padding: 10,
    width: '45%',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    alignItems: 'center',
  },

  uncurrentPublicButton: {
    padding: 10,
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },

  publicButtonTextWhite: {
    color: '#fff',
    fontWeight: 'bold',
  },

  publicButtonTextBlack: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Home;