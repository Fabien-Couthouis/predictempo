import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import { areRedDays } from '../../services/onnxPrediction';
import { TempoColor, retrieveTodayColor, retrieveTomorrowColor } from '../../services/redDaysRetriever';

type DayData = {
    name: string;
    isToday: boolean;
    date: Date;
};

const RedDaysWidget = () => {
    const [redDays, setRedDays] = useState<TempoColor[]>([]);
    const colorScheme = useColorScheme(); // Get the current theme

    // Get current day and calculate the previous, today, and next five days
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const nDaysToDisplay = 5;
    const nDaysInWeek = 7;

    // Generate an array of days for display
    const getDays = () => {
        let days = [];
        for (let i = 0; i < nDaysToDisplay; i++) {
            let index = (currentDayIndex + i + nDaysInWeek) % nDaysInWeek;
            let name = daysOfWeek[index];
            const isToday = i === 0;
            if (isToday) {
                name = "Aujourd'hui";
            }
            const dayData = { name: name, isToday: isToday, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i) } as DayData;
            days.push(dayData);
        }
        return days;
    };

    const displayedDays = getDays();

    useEffect(() => {
        const checkRedDays = async () => {
            const nextDaysAreRedPreds = await areRedDays(nDaysToDisplay - 1);

            const todayColor: TempoColor = await retrieveTodayColor();
            let nextDaysColors = [todayColor];
            for (let i = 0; i < nextDaysAreRedPreds.length; i++) {
                nextDaysColors.push(nextDaysAreRedPreds[i] ? TempoColor.RED : TempoColor.BLUE_OR_WHITE);
            }

            const tomorrowColor: TempoColor = await retrieveTomorrowColor();
            if (tomorrowColor !== TempoColor.UNKNOWN) {
                nextDaysColors[1] = tomorrowColor;
            }
            setRedDays(nextDaysColors);
        };

        checkRedDays();
    }, [displayedDays]);

    const getDaySquareStyle = (color: TempoColor, isToday: boolean) => {
        let style;
        switch (color) {
            case TempoColor.RED:
                style = styles.redDaySquare;
                break;
            case TempoColor.BLUE:
                style = styles.blueDaySquare;
                break;
            case TempoColor.WHITE:
                style = styles.whiteDaySquare;
                break;
            default:
                style = styles.greenDaySquare; // Default to green for BLUE_OR_WHITE
        }
        return [styles.daySquareBase, style, isToday && styles.todayHighlight];
    };

    const iconPath = require('../../assets/images/predictempo_icon_black.png'); // Path to your icon
    const separatorStyle = colorScheme === 'dark' ? styles.separatorLineDark : styles.separatorLineLight;
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Les Jours Rouges</Text>
            <Image source={iconPath} style={styles.topIcon} />
            <View style={styles.daysContainer}>
                {displayedDays.map((day, index) => (
                    <View key={index} style={styles.dayWrapper}>
                        <View style={getDaySquareStyle(redDays[index], day.isToday)}>
                            <Text style={styles.dayText}>{day.name}</Text>
                        </View>
                        {index < displayedDays.length - 1
                            && <View style={[styles.separatorLineBase, separatorStyle]} />}
                    </View>
                ))}
            </View>
            <Image source={iconPath} style={styles.bottomIcon} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    daysContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    dayWrapper: {
        alignItems: 'center',
    },
    daySquareBase: {
        paddingVertical: 15,
        paddingHorizontal: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        height: 60,
        width: 280,
        borderRadius: 10, // Make corners rounded
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    greenDaySquare: {
        backgroundColor: '#8fe75f',
    },
    blueDaySquare: {
        backgroundColor: '#44d3ca',
    },
    whiteDaySquare: {
        backgroundColor: '#FFFFFF',
    },
    redDaySquare: {
        backgroundColor: '#f42516',
    },
    todayHighlight: {
        shadowColor: '#FFF700', // Golden glow de toute beautée
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 10,
    },
    separatorLineBase: {
        width: 120,
        height: 1.5,
        marginTop: 10,
        marginBottom: 10,
    },
    separatorLineDark: {
        backgroundColor: '#888', // Use a visible gray color for dark mode
    },
    separatorLineLight: {
        backgroundColor: 'black', // Keep black for light mode
    },
    dayText: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    topIcon: {
        width: 150,
        height: 50,
        marginBottom: 30,
    },
    bottomIcon: {
        width: 150,
        height: 50,
        marginTop: 30,
        transform: [{ rotate: '180deg' }], // Flip the bottom icon
    },
});

export default RedDaysWidget;