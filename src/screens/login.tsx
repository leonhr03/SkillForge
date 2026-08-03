import 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import notifee from '@notifee/react-native';

function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loginScreen, setLoginScreen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('Firebase user:', user.uid);
        navigation.replace('Tabs');
      } else {
        setLoading(true);
      }
    });

    setupNotifications();

    return unsubscribe;
  }, [navigation]);

  async function setupNotifications() {
    await notifee.requestPermission();
  }

  const login = async (email: string, password: string) => {
    try {
      const user = await auth().signInWithEmailAndPassword(email, password);

      console.log('LOGIN SUCCESS:', user.user.uid);

      navigation.replace('Tabs');
    } catch (error: any) {
      console.log('LOGIN ERROR:', error.message);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (password === repeatPassword) {
      const user = await auth().createUserWithEmailAndPassword(email, password);
      console.log(user);

      const userUid = user.user.uid
      await database().ref(`/users/${userUid}`).set({
        uid: userUid,
        username: username,
        email: email,

      });
    }
  };

  const resetPasswort = async () => {
    await auth().sendPasswordResetEmail(resetEmail);
  };

  if (loading) {
    if (loginScreen) {
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>SkillForge</Text>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign in</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={'#888'}
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={'#888'}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setResetPassword(true)}>
              <Text>Reset password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => login(email, password)}
            >
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLoginScreen(!loginScreen)}>
              <Text>Don´t have a account? create one</Text>
            </TouchableOpacity>
          </View>

          <Modal transparent animationType={'slide'} visible={resetPassword}>
            <TouchableOpacity style={styles.modalContainer} onPress={() => setResetPassword(false)}>
              <Pressable style={styles.resetPasswortContainer} onPress={() => {}}>
                <Text style={styles.cardHeading}>Reset Password</Text>
                <TextInput
                  placeholder={'Email'}
                  style={styles.input}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => resetPasswort()}
                >
                  <Text style={styles.buttonText}>Send Email</Text>
                </TouchableOpacity>
              </Pressable>
            </TouchableOpacity>
          </Modal>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>SkillForge</Text>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign up</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={'#888'}
              style={styles.input}
            />

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={'#888'}
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={'#888'}
              style={styles.input}
            />
            <TextInput
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              placeholder="repeat Password"
              placeholderTextColor={'#888'}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => signUp(email, password)}
            >
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLoginScreen(!loginScreen)}>
              <Text>Already have a account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  heading: {
    color: '#3B82F6',
    fontSize: 40,
    fontWeight: 'bold',
  },

  card: {
    width: '90%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
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
    borderRadius: 10,
    padding: 10,
    width: '90%',
  },

  button: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
    width: '80%',
  },

  buttonText: {
    color: '#fff',
  },

  linkText: {
    color: '#3B82F6',
    fontSize: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  resetPasswortContainer: {
    height: '25%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
    alignItems: 'center',
  },
});

export default Login;
