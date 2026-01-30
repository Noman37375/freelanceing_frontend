import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Edit2 } from 'lucide-react-native';

interface AdminProfileCardProps {
    name: string;
    role: string;
    location: string;
    avatarUrl?: string;
}

export default function AdminProfileCard({ name, role, location, avatarUrl }: AdminProfileCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    {/* <Image
                        source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/default-avatar.png')}
                        style={styles.avatar}
                    /> */}
                </View>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.location}>{location}</Text>

                <TouchableOpacity style={styles.editButton}>
                    <Edit2 size={16} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>Edit profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#6366F1', // Indigo background to match reference
        borderRadius: 24,
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 4,
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
