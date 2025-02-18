// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, AppState } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import DropDownPicker from 'react-native-dropdown-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import BackgroundTimer from 'react-native-background-timer';
// import Sound from 'react-native-sound';

// const App = () => {
//   const [date, setDate] = useState(new Date());
//   const [showPicker, setShowPicker] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [reminders, setReminders] = useState([]);
//   const [activeAlarmId, setActiveAlarmId] = useState(null);
//   const [sound, setSound] = useState(null);
//   const appState = useRef(AppState.currentState); // Use useRef

//   const [categories] = useState([
//     { label: 'Yoga', value: 'yoga' },
//     { label: 'Exercise', value: 'exercise' },
//     { label: 'Meditation', value: 'meditation' },
//     { label: 'Breakfast', value: 'breakfast' },
//     { label: 'Lunch', value: 'lunch' },
//     { label: 'Dinner', value: 'dinner' },
//     { label: 'Reading', value: 'reading' },
//     { label: 'Study', value: 'study' },
//   ]);

//   useEffect(() => {
//     Sound.setCategory('Playback');
//     const alarmSound = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, (error) => {
//       if (error) {
//         console.log('Failed to load sound', error);
//         return;
//       }
//       alarmSound.setVolume(1.0);
//       alarmSound.setNumberOfLoops(-1);
//       setSound(alarmSound);
//     });

//     return () => {
//       if (alarmSound) {
//         alarmSound.release();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     loadReminders();

//     const subscription = AppState.addEventListener("change", nextAppState => {
//       if (appState.current.match(/inactive|background/) && nextAppState === "active") {
//         rescheduleAlarms();
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove(); // Remove listener
//       BackgroundTimer.clearInterval(intervalId.current);
//     };
//   }, []);

//   const intervalId = useRef(null); // useRef for interval ID

//   useEffect(() => {
//     intervalId.current = BackgroundTimer.setInterval(() => {
//       checkScheduledAlarms();
//     }, 60000);

//     return () => BackgroundTimer.clearInterval(intervalId.current);
//   }, [reminders]);

//   const rescheduleAlarms = () => {
//     reminders.forEach(reminder => {
//       const alarmTime = calculateNextAlarmTime(new Date(reminder.scheduledTimestamp));
//       if (alarmTime > Date.now()) {
//         scheduleBackgroundAlarm(reminder, alarmTime);
//       }
//     });
//   };

//   const checkScheduledAlarms = () => {
//     const now = new Date().getTime();

//     reminders.forEach(reminder => {
//       const alarmTime = calculateNextAlarmTime(new Date(reminder.scheduledTimestamp));

//       if (Math.abs(now - alarmTime) < 60000) {
//         triggerAlarm(reminder.id, reminder.category);
//       }
//     });
//   };

//   const calculateNextAlarmTime = (scheduledTime) => {
//     const now = new Date();
//     let targetTime = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate(),
//       scheduledTime.getHours(),
//       scheduledTime.getMinutes(),
//       0
//     );

//     if (targetTime <= now) {
//       targetTime.setDate(targetTime.getDate() + 1);
//     }

//     return targetTime.getTime();
//   };

//   const saveReminders = async (remindersToSave) => {
//     try {
//       await AsyncStorage.setItem('reminders', JSON.stringify(remindersToSave));
//     } catch (error) {
//       console.error('Error saving reminders:', error);
//     }
//   };

//   const loadReminders = async () => {
//     try {
//       const savedReminders = await AsyncStorage.getItem('reminders');
//       if (savedReminders !== null) {
//         const parsedReminders = JSON.parse(savedReminders);
//         setReminders(parsedReminders);
//       }
//     } catch (error) {
//       console.error('Error loading reminders:', error);
//     }
//   };

//   const triggerAlarm = (id, category) => {
//     if (sound) {
//       sound.play((success) => {
//         if (!success) {
//           console.log('Sound playback failed');
//         }
//       });
//     }

//     setActiveAlarmId(id);

//     Alert.alert(
//       'Discipline Reminder',
//       `Time for your ${category} activity!`,
//       [
//         {
//           text: 'Dismiss',
//           onPress: stopAlarm,
//           style: 'cancel',
//         },
//       ],
//       { cancelable: false }
//     );
//   };

//   const scheduleAlarm = () => {
//     if (!selectedCategory) {
//       Alert.alert('Error', 'Please select a category');
//       return;
//     }

//     const scheduledTime = new Date(date.getTime());
//     const id = Math.floor(Math.random() * 1000000).toString();
//     const nextTriggerTime = calculateNextAlarmTime(scheduledTime);

//     const newReminder = {
//       id: id,
//       category: selectedCategory,
//       time: scheduledTime.toLocaleTimeString(),
//       date: 'Daily',
//       scheduledTimestamp: scheduledTime.getTime(),
//     };

//     const updatedReminders = [...reminders, newReminder];
//     setReminders(updatedReminders);
//     saveReminders(updatedReminders);

//     scheduleBackgroundAlarm(newReminder, nextTriggerTime);

//     Alert.alert('Success', `Alarm set for ${new Date(nextTriggerTime).toLocaleString()}`);
//   };

//   const scheduleBackgroundAlarm = (reminder, alarmTime) => {
//     BackgroundTimer.setTimeout(() => {
//       triggerAlarm(reminder.id, reminder.category);
//     }, alarmTime - Date.now());
//   };


//   const deleteReminder = (id) => {
//     const updatedReminders = reminders.filter(reminder => reminder.id !== id);
//     setReminders(updatedReminders);
//     saveReminders(updatedReminders);
//   };

//   const stopAlarm = () => {
//     if (sound) {
//       sound.stop();
//     }
//     setActiveAlarmId(null);
//   };

//   const sendTestAlarm = () => {
//     const testId = 'test-' + Date.now();
//     triggerAlarm(testId, 'Test');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Discipline Alarm App</Text>
      
//       {/* Category Selector */}
//       <DropDownPicker
//         open={open}
//         value={selectedCategory}
//         items={categories}
//         setOpen={setOpen}
//         setValue={setSelectedCategory}
//         style={styles.dropdown}
//         containerStyle={styles.dropdownContainer}
//         zIndex={1000}
//       />

//       {/* Time Selector */}
//       <TouchableOpacity 
//         style={styles.button} 
//         onPress={() => setShowPicker(true)}
//       >
//         <Text style={styles.buttonText}>Select Time</Text>
//       </TouchableOpacity>
      
//       <Text style={styles.selectedTime}>
//         Selected Time: {date.toLocaleTimeString()}
//       </Text>

//       {showPicker && (
//         <DateTimePicker
//           value={date}
//           mode="time"
//           is24Hour={true}
//           display="default"
//           onChange={(event, selectedDate) => {
//             setShowPicker(false);
//             if (selectedDate) {
//               setDate(selectedDate);
//             }
//           }}
//         />
//       )}

//       {/* Set Alarm Button */}
//       <TouchableOpacity 
//         style={styles.button}
//         onPress={scheduleAlarm}
//       >
//         <Text style={styles.buttonText}>Set Alarm</Text>
//       </TouchableOpacity>

//       {/* Test Buttons */}
//       <View style={styles.testButtonsContainer}>
//         <TouchableOpacity 
//           style={[styles.button, styles.testButton, {backgroundColor: '#2196F3'}]}
//           onPress={sendTestAlarm}
//         >
//           <Text style={styles.buttonText}>Test Alarm</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[styles.button, styles.testButton, {backgroundColor: '#FF5722'}]}
//           onPress={stopAlarm}
//         >
//           <Text style={styles.buttonText}>Stop Alarm</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Alarms List */}
//       <Text style={styles.subtitle}>Current Alarms:</Text>
//       <ScrollView style={styles.reminderList}>
//         {reminders.map((reminder) => (
//           <TouchableOpacity
//             key={reminder.id}
//             style={[
//               styles.reminderItem,
//               activeAlarmId === reminder.id ? styles.activeReminder : null
//             ]}
//             onPress={() => deleteReminder(reminder.id)}
//           >
//             <Text style={styles.reminderText}>
//               {reminder.category} - {reminder.time}
//             </Text>
//             <Text style={styles.reminderSubText}>
//               Daily • Tap to delete
//             </Text>
//           </TouchableOpacity>
//         ))}
//         {reminders.length === 0 && (
//           <Text style={styles.noRemindersText}>No alarms set yet</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 10,
//   },
//   testButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   testButton: {
//     flex: 0.48,
//   },
//   buttonText: {
//     color: 'white',
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   selectedTime: {
//     fontSize: 16,
//     marginVertical: 10,
//     textAlign: 'center',
//   },
//   dropdownContainer: {
//     marginBottom: 20,
//     zIndex: 2000,
//   },
//   dropdown: {
//     backgroundColor: '#fafafa',
//   },
//   reminderList: {
//     marginTop: 10,
//     maxHeight: 250,
//   },
//   reminderItem: {
//     backgroundColor: '#f0f0f0',
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   activeReminder: {
//     backgroundColor: '#ffe0b2', // Light orange background for active alarm
//   },
//   reminderText: {
//     fontSize: 16,
//   },
//   reminderSubText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 5,
//   },
//   noRemindersText: {
//     textAlign: 'center',
//     color: '#999',
//     marginTop: 20,
//   }
// });

// export default App;

// App.js - Main application entry point
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import PomodoroScreen from './src/screens/PomodoroScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate splash screen loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
        <Stack.Screen name="TaskList" component={TaskListScreen} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;