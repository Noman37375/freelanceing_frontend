import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Edit2, Camera } from 'lucide-react-native';

interface AdminProfileCardProps {
    name: string;
    role: string;
    // location: string;
    avatarUrl?: string;
    onEditPress?: () => void;
    onAvatarPress?: () => void;
}

export default function AdminProfileCard({ name, role, avatarUrl, onEditPress, onAvatarPress }: AdminProfileCardProps) {
    const avatarSource = avatarUrl
        ? { uri: avatarUrl }
        : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff&size=200` };

    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={onAvatarPress}
                    activeOpacity={onAvatarPress ? 0.8 : 1}
                    disabled={!onAvatarPress}
                >
                    <Image source={avatarSource} style={styles.avatar} />
                    {onAvatarPress && (
                        <View style={styles.cameraBadge}>
                            <Camera size={18} color="#FFF" />
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={styles.name}>{name}</Text>
                {/* <Text style={styles.location}>{location}</Text> */}

                <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
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
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
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
