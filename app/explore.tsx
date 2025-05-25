import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

import { router } from 'expo-router'
import { setItemAsync } from 'expo-secure-store'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'

export default function TabTwoScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: any) => {
        console.log('Login data:', data)
        if (data.email === 'admin@admin.com' && data.password === '123456') {
            await setItemAsync('token', 'admin123456')
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Logged in',
                textBody: 'You have been logged in successfully',
            })
            router.replace('/')
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type='title' style={styles.titleText}>
                    ⚙️ Monitoring System
                </ThemedText>
            </ThemedView>

            <ThemedText style={styles.subText}>Enter your email and password to access the system.</ThemedText>

            {/* Email input */}
            <Controller
                control={control}
                rules={{
                    required: 'Email is required',
                    pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Enter a valid email address',
                    },
                }}
                name='email'
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder='Email'
                        placeholderTextColor='#777'
                        keyboardType='email-address'
                        autoCapitalize='none'
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        selectionColor='#4a90e2'
                    />
                )}
            />
            {errors.email && <ThemedText style={styles.errorText}>{errors.email.message}</ThemedText>}

            {/* Password input */}
            <Controller
                control={control}
                rules={{
                    required: 'Password is required',
                    minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                    },
                }}
                name='password'
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        placeholder='Password'
                        placeholderTextColor='#777'
                        secureTextEntry
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        selectionColor='#4a90e2'
                    />
                )}
            />
            {errors.password && <ThemedText style={styles.errorText}>{errors.password.message}</ThemedText>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
                <ThemedText style={styles.buttonText}>Login</ThemedText>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121822', // dark navy background
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 30,
    },
    titleContainer: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    titleText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#e1e6f0', // soft grayish-white
        textAlign: 'center',
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        includeFontPadding: false,
    },
    subText: {
        fontSize: 15,
        color: '#8892a6',
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: '400',
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: '#1e2739', // dark input background
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 14,
        fontSize: 16,
        color: '#e1e6f0',
        borderWidth: 1,
        borderColor: '#2a344b',
    },
    inputError: {
        borderColor: '#ff4d4f',
    },
    errorText: {
        color: '#ff4d4f',
        alignSelf: 'flex-start',
        marginBottom: 10,
        fontSize: 13,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#4a90e2', // calm steel blue
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#121822',
        fontWeight: '700',
        fontSize: 18,
    },
})
