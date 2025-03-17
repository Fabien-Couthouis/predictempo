import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { areRedDays } from '../../services/onnxPrediction';
import { TempoColor, retrieveTodayColor, retrieveTomorrowColor } from '../../services/redDaysRetriever';


type DayData = {
    name: string;
    isToday: boolean;
    date: Date;
}
const RedDaysWidget = () => {
    const [redDays, setRedDays] = useState<TempoColor[]>([]);

    // Get current day and calculate the previous, today, and next five days
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'jeudi', 'Vendredi', 'Samedi'];
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
        return [style, isToday && styles.todayHighlight];
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Les Jours Rouges</Text>
            <View style={styles.daysContainer}>
                {displayedDays.map((day, index) => (
                    <View
                        key={index}
                        style={getDaySquareStyle(redDays[index], day.isToday)}
                    >
                        <Text style={styles.dayText}>{day.name}</Text>
                    </View>
                ))}
            </View>
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    greenDaySquare: {
        backgroundColor: '#4CAF50',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        width: 100,
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    blueDaySquare: {
        backgroundColor: '#2196F3',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        width: 100,
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    whiteDaySquare: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        width: 100,
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    redDaySquare: {
        backgroundColor: '#D11B2B',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        width: 100,
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    todayHighlight: {
        shadowColor: '#FFF700', // Golden glow de toute beautée
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 10,
    },
    dayText: {
        fontSize: 18,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RedDaysWidget;