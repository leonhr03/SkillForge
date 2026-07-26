import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/tabs/home.tsx";
import Profile from "../screens/tabs/profile.tsx";
import Explore from "../screens/tabs/exploreNew.tsx";


const Tab = createBottomTabNavigator();


export default function Tabs() {

  return (
    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarStyle: {
          marginBottom: 20,
          borderRadius: 40,
          backgroundColor: "#000",
          width: "95%",
          alignSelf: "center",
          height: 70,
        },


        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#777777",


        tabBarLabelStyle: {
          fontSize: 15,
          marginBottom: 5,
        },


        tabBarIcon: ({ color, size }) => {

          let iconName: string = "";


          switch (route.name) {

            case "Home":
              iconName = "home-outline";
              break;


            case "Explore":
              iconName = "compass-outline";
              break;


            case "Profile":
              iconName = "person-circle-outline";
              break;


            default:
              iconName = "help-outline";
          }


          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );

        },

      })}

    >


      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />


      <Tab.Screen
        name="Explore"
        component={Explore}
      />


      <Tab.Screen
        name="Profile"
        component={Profile}
      />


    </Tab.Navigator>
  );
}