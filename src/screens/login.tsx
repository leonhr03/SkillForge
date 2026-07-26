import "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';




function Login({navigation} : any) {
  const [email, setEmail] = useState('leonhuber2010@gmail.com');
  const [password, setPassword] = useState('LeonTest');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loginScreen, setLoginScreen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const stored = await AsyncStorage.getItem("isLogdedIn");
      const isLogdedIn = stored ? JSON.parse(stored) : "";

      if(isLogdedIn === "true") {
        navigation.navigate("Tabs")
      } else {
        setLoading(true)
      }
    }

    checkLogin()
  }, [navigation]);


  const login = async (email: string, password: string) => {
    const user = await auth().signInWithEmailAndPassword(email, password);
    await AsyncStorage.setItem("isLogdedIn", JSON.stringify("true"))
    navigation.navigate('Tabs');
    console.log(user)
  }

  const signUp = async (email: string, password: string) => {
    if (password === repeatPassword) {
      const user = await auth().createUserWithEmailAndPassword(email, password);
      console.log(user)
      setLoginScreen(true);
    }
  }

  if(loading){
    if (loginScreen) {
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>SkillForge</Text>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign in</Text>
            <TextInput value={email} onChangeText={setEmail}  placeholder="Email" placeholderTextColor={"#888"} style={styles.input}/>
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={"#888"} style={styles.input}/>
            <TouchableOpacity style={styles.button} onPress={() => login(email, password)}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLoginScreen(!loginScreen)}>
              <Text>Don´t have a account? create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>SkillForge</Text>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign up</Text>
            <TextInput value={email} onChangeText={setEmail}  placeholder="Email" placeholderTextColor={"#888"} style={styles.input}/>
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={"#888"} style={styles.input}/>
            <TextInput value={repeatPassword} onChangeText={setRepeatPassword} placeholder="repeat Password" placeholderTextColor={"#888"} style={styles.input}/>
            <TouchableOpacity style={styles.button} onPress={() => signUp(email, password)}>
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLoginScreen(!loginScreen)}>
              <Text>Already have a account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20
  },

  heading: {
    color: '#3B82F6',
    fontSize: 40,
    fontWeight: 'bold',
  },

  card: {
    width: "90%",
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
    gap: 10,
    alignItems: 'center',
  },

  cardHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    alignSelf: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 15,
    padding: 10,
    width: '90%',
  },

  button: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 15,
    alignSelf: 'center',
    alignItems: 'center',
    width: "80%"
  },

  buttonText: {
    color: '#fff',
  },

  linkText: {
    color: '#3B82F6',
    fontSize: 10,
  }
})

export default Login;