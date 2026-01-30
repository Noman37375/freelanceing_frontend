import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

interface AdminAnalyticsCardProps {
    percentage: number;
    title: string;
    subTitle: string;
    value: string;
    subValue: string;
}

export default function AdminAnalyticsCard({ percentage, title, subTitle, value, subValue }: AdminAnalyticsCardProps) {
    const size = 120;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TrendingUp size={20} color="#1E293B" />
            </View>

            <View style={styles.chartContainer}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#F1F5F9"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#6366F1"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                </Svg>
                <View style={styles.chartOverlay}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                    <Text style={styles.performanceText}>Performance</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <View style={styles.dotContainer}>
                        <View style={[styles.dot, { backgroundColor: '#6366F1' }]} />
                        <Text style={styles.percentageValue}>{percentage}%</Text>
                    </View>
                    <Text style={styles.footerLabel}>Response rate</Text>
                </View>
                <View style={styles.footerItem}>
                    <View style={styles.dotContainer}>
                        <View style={[styles.dot, { backgroundColor: '#1E1B4B' }]} />
                        <Text style={styles.percentageValue}>{value}</Text>
                    </View>
                    <Text style={styles.footerLabel}>Active users</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        flex: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    chartOverlay: {
        position: 'absolute',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    performanceText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerItem: {
        flex: 1,
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    percentageValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    footerLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
    },
});
