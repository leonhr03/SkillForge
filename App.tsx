import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {setupNotifications} from './src/services/notifications.ts';

import Login from './src/screens/login';
import Tabs from "./src/navigation/Tabs.tsx"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

const Stack = createStackNavigator();

export default function App() {

  useEffect(() => {
    setupNotifications()
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={"Login"}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Tabs" component={Tabs}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}