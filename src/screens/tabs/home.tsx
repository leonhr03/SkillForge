import "react"
import { StyleSheet, Text, View } from 'react-native';
import {useSafeAreaInsets} from "react-native-safe-area-context";

function Home() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, {marginTop: insets.top + 16}]}>
            <Text style={styles.heading}>Welcome Back✌️</Text>

            <View style={styles.card}>
                <Text>Weiter Lernen</Text>
            </View>

            <View style={styles.card}>
                <Text>Aufgaben</Text>
            </View>
        </View>
    )
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
        width: "90%",
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
    },
})

export default Home;