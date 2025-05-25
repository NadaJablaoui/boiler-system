import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { deleteItemAsync, getItemAsync } from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
type TempData = {
    id: string
    time: string
    temperature: number
}

const dummyData: TempData[] = [
    { id: '1', time: '08:00', temperature: 22 },
    { id: '2', time: '10:00', temperature: 24 },
    { id: '3', time: '12:00', temperature: 26 },
    { id: '4', time: '14:00', temperature: 25 },
    { id: '5', time: '16:00', temperature: 23 },
]
export default function HomePage() {
    const [currentTemp, setCurrentTemp] = useState(24)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const token = await getItemAsync('token')
            if (!token) {
                router.replace('/explore')
            } else {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    const handleLogout = async () => {
        await deleteItemAsync('token')
        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Logged out',
            textBody: 'You have been logged out successfully',
        })
        router.replace('/explore')
    }

    const refetchTemp = async () => {
        try {
            console.log('Refetching temperature...')

            const response = await fetch('http://192.168.4.1/temperature')
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const { temperature } = await response.json()
            if (temperature !== undefined) {
                setCurrentTemp(temperature)
                console.log('Temperature updated:', temperature)
            } else {
                console.warn('Temperature field missing in response')
            }
        } catch (error) {
            console.error('Fetch error:', error)
        }
    }

    const renderItem = ({ item, index }: any) => (
        <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
            <ThemedText style={styles.tableCell}>{item.time}</ThemedText>
            <ThemedText style={styles.tableCell}>{item.temperature}°C</ThemedText>
        </View>
    )

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size='large' color='#4a90e2' />
            </View>
        )
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.welcomeText}>Welcome Admin</ThemedText>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
                    <ThemedText style={styles.logoutText}>Logout</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Current Temperature Card */}
            <LinearGradient colors={['#4a90e2', '#357ABD']} start={[0, 0]} end={[1, 1]} style={styles.tempCard}>
                <MaterialCommunityIcons name='thermometer' size={48} color='#fff' />
                <View style={styles.tempInfo}>
                    <View style={styles.tempLabelRow}>
                        <ThemedText style={styles.tempLabel}>Current Temperature</ThemedText>
                        <TouchableOpacity onPress={refetchTemp} style={styles.refetchButton} activeOpacity={0.7}>
                            <MaterialCommunityIcons name='refresh' size={20} color='#cbd6f0' />
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.tempValue}>{currentTemp}°C</ThemedText>
                </View>
            </LinearGradient>

            {/* Table */}
            <View style={styles.tableContainer}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>Time</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>Temperature</ThemedText>
                </View>

                <FlatList
                    data={dummyData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%' }}
                />
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121822',
        paddingHorizontal: 24,
        paddingTop: 70, // increased top padding for better vertical balance
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 50, // more spacing below header
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#e1e6f0',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        // borderWidth: 1,
        // borderColor: '#4a90e2',
        paddingHorizontal: 18,
        paddingVertical: 10,
        // borderRadius: 20,
        shadowColor: '#357ABD',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        color: '#4a90e2',
        fontWeight: '600',
        fontSize: 14,
    },
    tempCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingVertical: 25,
        paddingHorizontal: 30,
        marginBottom: 40, // increased margin below card
        shadowColor: '#357ABD',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    tempInfo: {
        marginLeft: 24,
    },
    tempLabel: {
        fontSize: 16,
        color: '#d0d6e3',
        marginBottom: 6,
        fontWeight: '500',
    },
    tempValue: {
        paddingTop: 20,
        fontSize: 40,
        fontWeight: '800',
        color: '#fff',
    },
    tableContainer: {
        backgroundColor: '#1e2739',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 7,
        elevation: 5,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    tableRowEven: {
        backgroundColor: '#283348',
    },
    tableRowOdd: {
        backgroundColor: '#1e2739',
    },
    tableCell: {
        flex: 1,
        fontSize: 16,
        color: '#e1e6f0',
        textAlign: 'center',
        fontWeight: '600',
    },
    tableHeader: {
        backgroundColor: '#4a90e2',
        borderRadius: 12,
        marginBottom: 12,
    },
    tableHeaderText: {
        color: '#121822',
        fontWeight: '700',
    },
    tempLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    refetchButton: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
})
