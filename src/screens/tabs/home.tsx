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
import database from "@react-native-firebase/database"
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/core';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Progress from "react-native-progress"

interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  tasks: string[];
}

interface Todo {
  title: string;
  checked: boolean;
  lastReset: string;
}

function Home() {
  const insets = useSafeAreaInsets();
  const [yourHabits, setYourHabits] = useState<Habit[]>([])
  const [dailyTasks, setDailyTasks] = useState<Todo[]>([]);
  const [addModal, setAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newTask, setNewTask] = useState("")
  const [newTasks, setNewTasks] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");
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
  const [taskProgress, setTaskProgress] = useState<number>();

    useFocusEffect(
        React.useCallback(() => {

            const loadYourHabits = async () => {
                const today = new Date().toISOString().split("T")[0];

                const storedHabits = await AsyncStorage.getItem("myHabits");
                const parsed: Habit[] = storedHabits ? JSON.parse(storedHabits) : [];

                setYourHabits(parsed);

                const storedTasks = await AsyncStorage.getItem("dailyTasks");
                const oldTasks: Todo[] = storedTasks ? JSON.parse(storedTasks) : [];

                const resetTasks = oldTasks.map(todo => {
                    if (todo.lastReset !== today) {
                        return {
                            ...todo,
                            checked: false,
                            lastReset: today,
                        };
                    }

                    return todo;
                });

                const allTasks: Todo[] = [];

                parsed.forEach(habit => {
                    habit.tasks.forEach(task => {

                        const existingTask = resetTasks.find(
                            oldTask => oldTask.title === task
                        );

                        allTasks.push(
                            existingTask
                                ? existingTask
                                : {
                                    title: task,
                                    checked: false,
                                    lastReset: today,
                                }
                        );

                    });
                });

                setDailyTasks(allTasks);

                await AsyncStorage.setItem(
                    "dailyTasks",
                    JSON.stringify(allTasks)
                );
            };

            loadYourHabits();

        }, [])
    );

    const addNewHabit = async () => {
        try {
            Alert.alert("START DATABASE");

            if (!newTitle.trim()) {
                Alert.alert("Error", "Title fehlt");
                return;
            }

            const ref = database().ref('/socialHabits');

            await ref.push({
                title: newTitle,
                description: newDescription,
                category: categoryValue || "none",
                tasks: newTasks
            });

            Alert.alert("DATABASE SUCCESS");

        } catch (error: any) {
            Alert.alert(
                "DATABASE ERROR",
                error?.message || "Unknown error"
            );

            console.log(error);
        }
    };

  const checkTodo = async (currentTodo: string) => {
    const stored = await AsyncStorage.getItem("dailyTasks");
    const parsed: Todo[] = stored ? JSON.parse(stored) : [];

    const updatedTasks = parsed.map((todo) =>
      todo.title === currentTodo
        ? { ...todo, checked: !todo.checked }
        : todo
    );

    const doneTasks: number = updatedTasks.filter(todo => todo.checked).length;

    const totalTasks: number = updatedTasks.length

    const progress: number = doneTasks / totalTasks

    setTaskProgress(progress)

    await AsyncStorage.setItem(
      "dailyTasks",
      JSON.stringify(updatedTasks)
    );



    setDailyTasks(updatedTasks)
  };

  const addTask = () => {
    if (newTask.trim() === "") return;

    setNewTasks([...newTasks, newTask]);
    setNewTask("");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16 }
      ]}
    >
      <Text style={styles.heading}>Welcome Back✌️</Text>

      <View style={styles.card} >
        <Text style={styles.cardTitle}>1/3 tasks checked</Text>
        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={taskProgress ?? 0}
            width={null}
            height={12}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Habits</Text>
        { yourHabits?.map(item => (
          <View style={styles.card}>
            <Text>{item.title}</Text>
          </View>
        ))
        }
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Tasks</Text>
        { dailyTasks?.map(item => (
          <View style={[styles.card, styles.taskItemInner]}>
            <Text>{item.title}</Text>
            <TouchableOpacity style={styles.taskItemButton} onPress={() => checkTodo(item.title)}>
              { item.checked ?
                ( <Text style={styles.taskItemButtonText}>Erledigt</Text> ) :
                ( <Text style={styles.taskItemButtonText}>Ausstehend</Text>)

              }

            </TouchableOpacity>
          </View>
        ))
        }
      </View>

      <View style={[styles.card, styles.taskItemInner]}>
        <Text style={styles.cardTitle}>Add new habit</Text>
        <TouchableOpacity style={styles.openAddAlertButton} onPress={() => setAddModal(true)}>
          <Text style={styles.openAddAlertButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent animationType={'slide'} visible={addModal}>
        <Pressable style={styles.modalContainer} onPress={() => setAddModal(false)}>
          <Pressable style={styles.addHabitContainer} onPress={() => {}}>
            <Text style={styles.heading}>Add new Habit</Text>

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Title"
              placeholderTextColor={"#777"}
              style={styles.addHabitInput}
            />

            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description"
              placeholderTextColor={"#777"}
              multiline
              style={[styles.addHabitInput, styles.descriptionInput]}
            />

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
                placeholderTextColor={"#777"}
                style={styles.taskInput}
              />

              <TouchableOpacity
                style={styles.taskAddButton}
                onPress={addTask}
              >
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


            <TouchableOpacity style={styles.addButton} onPress={() => addNewHabit()}>
              <Text style={styles.addButtonText} >
                Add Habit
              </Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
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
    alignSelf: "center",
    width: "50%",
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
  },

  addHabitInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },

  categoryPicker: {
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
    borderColor: "#000",
  },

  categoryDropdown: {
    width: "95%",
    alignSelf: "center",
    borderColor: "#000",
  },

  taskInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "95%",
    alignSelf: "center",
    gap: 8,
  },

  taskInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
  },

  taskAddButton: {
    backgroundColor: "#3B82F6",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  taskAddButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  taskList: {
    width: "95%",
    alignSelf: "center",
    gap: 5,
  },

  taskPreview: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
  },

  progressContainer: {
    width: "95%",
    alignSelf: "center",
  },
});

export default Home;
