import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useWindowDimensions, Platform } from 'react-native';

interface ProjectActivity {
    id: string;
    clientName: string;
    clientAvatar?: string;
    projectName: string;
    price: string;
    deliveredIn: string;
    progress: number;
}

interface AdminActivityTableProps {
    projects: ProjectActivity[];
}

export default function AdminActivityTable({ projects }: AdminActivityTableProps) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const tableWidth = Math.max(width - 48, 900); // Slightly wider for better breathing room

    if (isMobile) {
        return (
            <View style={styles.mobileList}>
                {projects.map((project) => (
                    <View key={project.id} style={styles.mobileCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.clientCell}>
                                <View style={styles.avatarContainer}>
                                    {project.clientAvatar ? (
                                        <Image source={{ uri: project.clientAvatar }} style={styles.avatar} />
                                    ) : (
                                        <View style={styles.placeholderAvatar}>
                                            <Text style={styles.avatarLetter}>{project.clientName[0]}</Text>
                                        </View>
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.clientName}>{project.clientName}</Text>
                                    <Text style={styles.projectName}>{project.projectName}</Text>
                                </View>
                            </View>
                            <Text style={styles.price}>{project.price}</Text>
                        </View>

                        <View style={styles.cardInfo}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Time left</Text>
                                <Text style={styles.infoValue}>{project.deliveredIn}</Text>
                            </View>
                            <View style={[styles.infoItem, { alignItems: 'flex-end' }]}>
                                <Text style={styles.infoLabel}>Progress</Text>
                                <View style={styles.progressRow}>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${project.progress}%` }]} />
                                    </View>
                                    <Text style={styles.progressText}>{project.progress}%</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.mobileViewButton}>
                            <Text style={styles.mobileViewButtonText}>View Order Details</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={styles.outerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={[styles.container, { width: tableWidth }]}>
                    <View style={styles.header}>
                        <Text style={[styles.columnHeader, styles.nameCol]}>Client Details</Text>
                        <Text style={[styles.columnHeader, styles.projectCol]}>Project Name</Text>
                        <Text style={[styles.columnHeader, styles.priceCol, styles.centerAlign]}>Rate</Text>
                        <Text style={[styles.columnHeader, styles.deliveryCol, styles.centerAlign]}>Timeline</Text>
                        <Text style={[styles.columnHeader, styles.progressCol, styles.rightAlign]}>Completion Status</Text>
                    </View>

                    <View style={styles.list}>
                        {projects.map((project) => (
                            <View key={project.id} style={styles.row}>
                                <View style={[styles.cell, styles.clientCell, styles.nameCol]}>
                                    <View style={styles.avatarContainer}>
                                        {project.clientAvatar ? (
                                            <Image source={{ uri: project.clientAvatar }} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.placeholderAvatar}>
                                                <Text style={styles.avatarLetter}>{project.clientName[0]}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.clientName}>{project.clientName}</Text>
                                        <TouchableOpacity>
                                            <Text style={styles.viewOrder}>View Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={[styles.cell, styles.projectCol]}>
                                    <Text style={styles.projectName} numberOfLines={1}>{project.projectName}</Text>
                                </View>

                                <View style={[styles.cell, styles.priceCol]}>
                                    <View style={styles.priceBadge}>
                                        <Text style={styles.priceText}>{project.price}</Text>
                                    </View>
                                </View>

                                <View style={[styles.cell, styles.deliveryCol]}>
                                    <Text style={[styles.delivered, styles.centerAlign]}>{project.deliveredIn}</Text>
                                </View>

                                <View style={[styles.cell, styles.progressCol]}>
                                    <View style={styles.progressRow}>
                                        <View style={styles.progressBarWrapper}>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${project.progress}%` }]} />
                                            </View>
                                            <Text style={styles.progressText}>{project.progress}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginTop: 24,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 20px rgba(0,0,0,0.04)' } as any,
        }),
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 12,
    },
    columnHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    nameCol: { flex: 2.5 },
    projectCol: { flex: 2 },
    priceCol: { flex: 1 },
    deliveryCol: { flex: 1.5 },
    progressCol: { flex: 2 },
    centerAlign: {
        textAlign: 'center',
    },
    rightAlign: {
        textAlign: 'right',
    },
    list: {
        gap: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        ...Platform.select({
            web: {
                transition: 'background-color 0.2s',
                ':hover': { backgroundColor: '#F8FAFC' }
            } as any
        })
    },
    cell: {
        justifyContent: 'center',
    },
    clientCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' } as any
        })
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    placeholderAvatar: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
    },
    avatarLetter: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 18,
    },
    clientName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    viewOrder: {
        fontSize: 12,
        color: '#6366F1',
        fontWeight: '700',
    },
    projectName: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
    },
    priceBadge: {
        alignSelf: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#6366F1',
    },
    delivered: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    progressBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 140,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
        width: 42,
        textAlign: 'right',
    },
    // Mobile Card Styles
    mobileList: {
        marginTop: 16,
        gap: 16,
    },
    mobileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 4 },
        }),
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 20,
    },
    infoItem: {
        gap: 6,
    },
    infoLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    infoValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '700',
    },
    mobileViewButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    mobileViewButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: '#6366F1',
    },
});
