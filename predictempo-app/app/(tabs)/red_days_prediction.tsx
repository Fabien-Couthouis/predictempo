import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isRedDay } from '../../services/onnxPrediction'; 

const RedDaysWidget = () => {
    const [isRed, setIsRed] = useState(false);

    useEffect(() => {
        const checkRedDay = async () => {
        const today = new Date();
        const result = await isRedDay(today);
        setIsRed(result);
        };

        checkRedDay();
    }, []);

  // Get current day and calculate the previous, today, and next five days
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIndex = today.getDay();
  const nDaysToDisplay = 5;
  const nDaysInWeek = 7;

  // Generate an array of days for display
  const getDays = () => {
    let days = [];
    for (let i = -1; i <= nDaysToDisplay; i++) {
      let index = (currentDayIndex + i + nDaysInWeek) % nDaysInWeek; 
      days.push({ name: daysOfWeek[index], isToday: i === 0, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i) });
    }
    return days;
  };

  const displayedDays = getDays();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Les gours rouges</Text>
      <View style={styles.daysContainer}>
        {displayedDays.map((day, index) => (
          <View
            key={index}
            style={[
                isRed ? styles.redDaySquare : styles.greenDaySquare, 
                day.isToday && styles.todayHighlight // Highlight today's square with shadow/light effects
            ]}
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
    shadowColor: '#FFF700', // Golden glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  dayText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RedDaysWidget;
