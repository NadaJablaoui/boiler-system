import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { deleteItemAsync, getItemAsync } from 'expo-secure-store'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { bootTime } from '../constants/bootTime'

type TempData = {
    id: string
    date: string
    time: string
    temperature: number
    post: string
}

export default function HomePage() {
    const [currentTemp, setCurrentTemp] = useState(24)
    const [cycleData, setCycleData] = useState<TempData[]>([])
    const [loading, setLoading] = useState(true)
    const [refetchingTemp, setRefetchingTemp] = useState(false)
    const [refetchingCycle, setRefetchingCycle] = useState(false)
    // const [bootTime, setBootTime] = useState<any>(Date.now())
    const router = useRouter()
    //const espStartTime = Date.now()

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
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Refetching temperature...',
            })

            setRefetchingTemp(true)

            const response = await fetch('http://192.168.4.1/temperature')
            console.log('response', response)

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const { temperature } = await response.json()

            if (temperature !== undefined) {
                setCurrentTemp(temperature)
                setRefetchingTemp(false)
            } else {
                console.warn('Temperature field missing in response')
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Problem occured refetching temperature',
            })
            console.error('Fetch error:', error)
        } finally {
            setRefetchingTemp(false)
        }
    }

    const refetchCycle = async () => {
        try {
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Refetching button history...',
            })
            setRefetchingCycle(true)

            const response = await fetch('http://192.168.4.1/button-history')

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

            const data = await response.json()

            //const espStartTime = Date.now()

            const formattedData = data.button_presses
                .map((entry: any, index: any) => {
                    const realTimestamp = bootTime + entry.timestamp
                    const dateTime = moment(realTimestamp)

                    return {
                        id: index.toString(),
                        date: dateTime.format('YYYY-MM-DD'),
                        time: dateTime.format('HH:mm'),
                        temperature: entry.temperature,
                        post: 'Post 8',
                    }
                })
                .reverse()

            setCycleData(formattedData)
            setRefetchingCycle(false)
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Problem occured refetching button history',
            })
            console.error('Button history fetch error:', error)
        } finally {
            setRefetchingCycle(false)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (!refetchingTemp) {
                refetchTemp()
            }
            if (!refetchingCycle) {
                refetchCycle()
            }
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const renderItem = ({ item, index }: any) => (
        <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
            <ThemedText style={styles.tableCell}>{item.date}</ThemedText>
            <ThemedText style={styles.tableCell}>{item.time}</ThemedText>
            <ThemedText style={styles.tableCell}>{item.temperature}°C</ThemedText>
            <ThemedText style={styles.tableCell}>{item.post}</ThemedText>
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
                <View>
                    <ThemedText style={styles.welcomeText}>Welcome</ThemedText>
                    <ThemedText style={{ fontSize: 16, color: '#4a90e2', fontWeight: '500', marginTop: 4 }}>#post8</ThemedText>
                </View>
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
                        {/* <TouchableOpacity onPress={refetchTemp} disabled={refetchingTemp} style={styles.refetchButton} activeOpacity={0.7}>
                            <MaterialCommunityIcons name='refresh' size={20} color='#cbd6f0' />
                        </TouchableOpacity> */}
                    </View>
                    <ThemedText style={{ padding: Platform.OS === 'ios' ? 20 : 10, fontSize: 40, fontWeight: '800', color: '#fff' }}>
                        {currentTemp}°C
                    </ThemedText>
                </View>
            </LinearGradient>

            {/* Table */}
            <View style={styles.tableContainer}>
                <View style={styles.cycleLabelRow}>
                    <ThemedText style={styles.tableTitle}>System Active Cycles</ThemedText>
                    {/* <TouchableOpacity onPress={refetchCycle} disabled={refetchingCycle} style={styles.refetchButton} activeOpacity={0.7}>
                        <MaterialCommunityIcons name='refresh' size={20} color='#cbd6f0' />
                    </TouchableOpacity> */}
                </View>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>Date</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>Time</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>Temp</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>Post</ThemedText>
                </View>

                <FlatList
                    data={cycleData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
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
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        marginBottom: 50,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#e1e6f0',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 18,
        paddingVertical: 10,
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
    // tempCard: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     borderRadius: 15,
    //     paddingVertical: 25,
    //     paddingHorizontal: 30,
    //     marginBottom: 40,
    //     shadowColor: '#357ABD',
    //     shadowOffset: { width: 0, height: 6 },
    //     shadowOpacity: 0.4,
    //     shadowRadius: 8,
    //     elevation: 8,
    // },
    // tempInfo: {
    //     marginLeft: 24,
    // },
    tempLabel: {
        fontSize: 20,
        color: '#d0d6e3',
        marginBottom: 6,
        fontWeight: '500',
    },
    tempCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
        backgroundColor: '#4a90e2',
        shadowColor: '#357ABD',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    tempInfo: {
        flex: 1,
        marginLeft: 15,
    },
    tempLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cycleLabelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '5%',
        marginBottom: 8,
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
    refetchButton: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#cbd6f0',
        marginBottom: 12,
        textAlign: 'center',
    },
})
