import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import auth from '@react-native-firebase/auth';




export default function Profile({navigation}: any) {
    const insets = useSafeAreaInsets()

    const logOut = () => {
        auth().signOut()
        navigation.navigate("Login")
    }

    return (
        <View style={[styles.container, {paddingTop: insets.top + 16}]}>
            <Text>Profile Screen</Text>
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
})