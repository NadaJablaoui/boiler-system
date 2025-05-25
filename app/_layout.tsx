import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { AlertNotificationRoot } from 'react-native-alert-notification'

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    })

    if (!loaded) {
        // Async font loading only occurs in development.
        return null
    }

    return (
        <AlertNotificationRoot>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name='explore' options={{ headerShown: false }} />
                    <Stack.Screen name='index' options={{ headerShown: false }} />
                </Stack>
                <StatusBar style='auto' />
            </ThemeProvider>
        </AlertNotificationRoot>
    )
}
