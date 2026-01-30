import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface AdminEarningReportProps {
    revenue: string;
    trend: string;
}

export default function AdminEarningReport({ revenue, trend }: AdminEarningReportProps) {
    const width = Dimensions.get('window').width * 0.5; // Estimated width
    const height = 120;

    // Fake path for the line chart
    const path = "M0 100 Q 20 80, 40 90 T 80 60 T 120 70 T 160 30 T 200 50 T 240 10 L 240 120 L 0 120 Z";
    const linePath = "M0 100 Q 20 80, 40 90 T 80 60 T 120 70 T 160 30 T 200 50 T 240 10";

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Earning reports</Text>
                    <View style={styles.revenueContainer}>
                        <Text style={styles.revenue}>{revenue}</Text>
                        <View style={styles.trendBadge}>
                            <View style={styles.trendDot} />
                            <Text style={styles.trendText}>{trend}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.filterContainer}>
                    <Text style={styles.filterText}>Yearly</Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Svg width="100%" height={height} viewBox="0 0 240 120" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#A78BFA" stopOpacity="0.3" />
                            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    <Path d={path} fill="url(#grad)" />
                    <Path d={linePath} stroke="#8B5CF6" strokeWidth="3" fill="none" strokeLinecap="round" />

                    {/* Data Point */}
                    <View style={[styles.dataPoint, { left: '80%', top: '25%' }]}>
                        <View style={styles.dataPointDot} />
                        <View style={styles.dataPointLabel}>
                            <Text style={styles.dataPointValue}>$5,569</Text>
                            <Text style={styles.dataPointOrder}>897 order</Text>
                        </View>
                    </View>
                </Svg>
            </View>

            <View style={styles.months}>
                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((m) => (
                    <Text key={m} style={styles.monthText}>{m}</Text>
                ))}
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
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    revenueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    revenue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    trendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#8B5CF6',
    },
    trendText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    filterText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    chartContainer: {
        height: 120,
        marginBottom: 10,
    },
    months: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    monthText: {
        fontSize: 8,
        color: '#94A3B8',
        fontWeight: '700',
    },
    dataPoint: {
        position: 'absolute',
        alignItems: 'center',
    },
    dataPointDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1E1B4B',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    dataPointLabel: {
        backgroundColor: '#1E1B4B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        alignItems: 'center',
    },
    dataPointValue: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    dataPointOrder: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 8,
    }
});
