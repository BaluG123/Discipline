// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Slider
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  // Timer settings
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [pomodoroCount, setPomodoroCount] = useState(4);
  
  // Notification settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Theme settings
  const [darkMode, setDarkMode] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalPomodorosCompleted: 0,
    totalMinutesFocused: 0,
    currentStreak: 0
  });
  
  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);
  
  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('pomodoroSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        
        // Convert seconds to minutes for UI
        setPomodoroTime(parsedSettings.pomodoroTime / 60);
        setShortBreakTime(parsedSettings.shortBreakTime / 60);
        setLongBreakTime(parsedSettings.longBreakTime / 60);
        
        setPomodoroCount(parsedSettings.pomodoroCount);
        setSoundEnabled(parsedSettings.soundEnabled);
        setVibrationEnabled(parsedSettings.vibrationEnabled);
      }
      
      const storedTheme = await AsyncStorage.getItem('themeSettings');
      if (storedTheme) {
        const parsedTheme = JSON.parse(storedTheme);
        setDarkMode(parsedTheme.darkMode);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };
  
  const loadStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem('pomodoroStats');
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };
  
  const saveSettings = async () => {
    try {
      // Convert minutes to seconds for storage
      const settings = {
        pomodoroTime: pomodoroTime * 60,
        shortBreakTime: shortBreakTime * 60,
        longBreakTime: longBreakTime * 60,
        pomodoroCount,
        soundEnabled,
        vibrationEnabled
      };
      
      await AsyncStorage.setItem('pomodoroSettings', JSON.stringify(settings));
      
      const themeSettings = {
        darkMode
      };
      
      await AsyncStorage.setItem('themeSettings', JSON.stringify(themeSettings));
      
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };
  
  const resetStats = () => {
    Alert.alert(
      'Reset Stats',
      'Are you sure you want to reset all your statistics? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              const resetStats = {
                totalPomodorosCompleted: 0,
                totalMinutesFocused: 0,
                currentStreak: 0
              };
              
              await AsyncStorage.setItem('pomodoroStats', JSON.stringify(resetStats));
              setStats(resetStats);
              
              Alert.alert('Success', 'Statistics have been reset.');
            } catch (error) {
              console.error('Failed to reset stats', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };
  
  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              setPomodoroTime(25);
              setShortBreakTime(5);
              setLongBreakTime(15);
              setPomodoroCount(4);
              setSoundEnabled(true);
              setVibrationEnabled(true);
              setDarkMode(false);
              
              const defaultSettings = {
                pomodoroTime: 25 * 60,
                shortBreakTime: 5 * 60,
                longBreakTime: 15 * 60,
                pomodoroCount: 4,
                // Completing the SettingsScreen.js file that was cut off
// This continues from where the provided code ended

soundEnabled: true,
vibrationEnabled: true,
};

await AsyncStorage.setItem('pomodoroSettings', JSON.stringify(defaultSettings));

const defaultThemeSettings = {
darkMode: false
};

await AsyncStorage.setItem('themeSettings', JSON.stringify(defaultThemeSettings));

Alert.alert('Success', 'Settings have been reset to defaults.');
} catch (error) {
console.error('Failed to reset settings', error);
}
},
style: 'destructive',
},
],
);
};

return (
<View style={styles.container}>
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()}>
<Icon name="arrow-left" size={28} color="#333" />
</TouchableOpacity>
<Text style={styles.headerTitle}>Settings</Text>
<View style={styles.headerRight} />
</View>

<ScrollView style={styles.content}>
<View style={styles.section}>
<Text style={styles.sectionTitle}>Timer Settings</Text>

<View style={styles.settingItem}>
<Text style={styles.settingLabel}>Pomodoro Length (minutes)</Text>
<View style={styles.sliderContainer}>
<Slider
style={styles.slider}
minimumValue={5}
maximumValue={60}
step={1}
value={pomodoroTime}
onValueChange={setPomodoroTime}
minimumTrackTintColor="#F44336"
maximumTrackTintColor="#EEEEEE"
thumbTintColor="#F44336"
/>
<Text style={styles.sliderValue}>{pomodoroTime}</Text>
</View>
</View>

<View style={styles.settingItem}>
<Text style={styles.settingLabel}>Short Break Length (minutes)</Text>
<View style={styles.sliderContainer}>
<Slider
style={styles.slider}
minimumValue={1}
maximumValue={15}
step={1}
value={shortBreakTime}
onValueChange={setShortBreakTime}
minimumTrackTintColor="#4CAF50"
maximumTrackTintColor="#EEEEEE"
thumbTintColor="#4CAF50"
/>
<Text style={styles.sliderValue}>{shortBreakTime}</Text>
</View>
</View>

<View style={styles.settingItem}>
<Text style={styles.settingLabel}>Long Break Length (minutes)</Text>
<View style={styles.sliderContainer}>
<Slider
style={styles.slider}
minimumValue={5}
maximumValue={30}
step={1}
value={longBreakTime}
onValueChange={setLongBreakTime}
minimumTrackTintColor="#2196F3"
maximumTrackTintColor="#EEEEEE"
thumbTintColor="#2196F3"
/>
<Text style={styles.sliderValue}>{longBreakTime}</Text>
</View>
</View>

<View style={styles.settingItem}>
<Text style={styles.settingLabel}>Pomodoros until long break</Text>
<View style={styles.sliderContainer}>
<Slider
style={styles.slider}
minimumValue={2}
maximumValue={8}
step={1}
value={pomodoroCount}
onValueChange={setPomodoroCount}
minimumTrackTintColor="#FF9800"
maximumTrackTintColor="#EEEEEE"
thumbTintColor="#FF9800"
/>
<Text style={styles.sliderValue}>{pomodoroCount}</Text>
</View>
</View>
</View>

<View style={styles.section}>
<Text style={styles.sectionTitle}>Notification Settings</Text>

<View style={styles.settingToggleItem}>
<Text style={styles.settingLabel}>Sound Alerts</Text>
<Switch
value={soundEnabled}
onValueChange={setSoundEnabled}
trackColor={{ false: '#CCCCCC', true: '#F44336' }}
thumbColor={soundEnabled ? '#FFFFFF' : '#F5F5F5'}
/>
</View>

<View style={styles.settingToggleItem}>
<Text style={styles.settingLabel}>Vibration</Text>
<Switch
value={vibrationEnabled}
onValueChange={setVibrationEnabled}
trackColor={{ false: '#CCCCCC', true: '#F44336' }}
thumbColor={vibrationEnabled ? '#FFFFFF' : '#F5F5F5'}
/>
</View>
</View>

<View style={styles.section}>
<Text style={styles.sectionTitle}>Appearance</Text>

<View style={styles.settingToggleItem}>
<Text style={styles.settingLabel}>Dark Mode</Text>
<Switch
value={darkMode}
onValueChange={setDarkMode}
trackColor={{ false: '#CCCCCC', true: '#333333' }}
thumbColor={darkMode ? '#FFFFFF' : '#F5F5F5'}
/>
</View>
</View>

<View style={styles.statsSection}>
<Text style={styles.sectionTitle}>Your Statistics</Text>

<View style={styles.statsContainer}>
<View style={styles.statItem}>
<Text style={styles.statValue}>{stats.totalPomodorosCompleted}</Text>
<Text style={styles.statLabel}>Total Pomodoros</Text>
</View>

<View style={styles.statItem}>
<Text style={styles.statValue}>{stats.totalMinutesFocused}</Text>
<Text style={styles.statLabel}>Minutes Focused</Text>
</View>

<View style={styles.statItem}>
<Text style={styles.statValue}>{stats.currentStreak}</Text>
<Text style={styles.statLabel}>Current Streak</Text>
</View>
</View>

<TouchableOpacity
style={styles.resetStatsButton}
onPress={resetStats}
>
<Text style={styles.resetStatsButtonText}>Reset Statistics</Text>
</TouchableOpacity>
</View>

<TouchableOpacity
style={styles.saveButton}
onPress={saveSettings}
>
<Text style={styles.saveButtonText}>Save Settings</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.resetSettingsButton}
onPress={resetSettings}
>
<Text style={styles.resetSettingsButtonText}>Reset to Defaults</Text>
</TouchableOpacity>
</ScrollView>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#f9f9f9',
},
header: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingHorizontal: 20,
paddingTop: 60,
paddingBottom: 20,
backgroundColor: '#fff',
borderBottomWidth: 1,
borderBottomColor: '#eee',
},
headerTitle: {
fontSize: 20,
fontWeight: 'bold',
color: '#333',
},
headerRight: {
width: 28, // To balance the back button on the left
},
content: {
flex: 1,
padding: 20,
},
section: {
backgroundColor: '#fff',
borderRadius: 10,
padding: 20,
marginBottom: 20,
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 2,
},
sectionTitle: {
fontSize: 18,
fontWeight: 'bold',
marginBottom: 15,
color: '#333',
},
settingItem: {
marginBottom: 20,
},
settingToggleItem: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 15,
},
settingLabel: {
fontSize: 16,
color: '#333',
marginBottom: 8,
},
sliderContainer: {
flexDirection: 'row',
alignItems: 'center',
},
slider: {
flex: 1,
height: 40,
},
sliderValue: {
fontSize: 16,
fontWeight: 'bold',
marginLeft: 10,
width: 30,
textAlign: 'right',
},
statsSection: {
backgroundColor: '#fff',
borderRadius: 10,
padding: 20,
marginBottom: 30,
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 2,
},
statsContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 20,
},
statItem: {
alignItems: 'center',
flex: 1,
},
statValue: {
fontSize: 24,
fontWeight: 'bold',
marginBottom: 5,
color: '#333',
},
statLabel: {
fontSize: 14,
color: '#666',
textAlign: 'center',
},
resetStatsButton: {
backgroundColor: '#ff5722',
borderRadius: 8,
paddingVertical: 12,
alignItems: 'center',
},
resetStatsButtonText: {
fontSize: 16,
color: '#fff',
fontWeight: '500',
},
saveButton: {
backgroundColor: '#4CAF50',
borderRadius: 10,
paddingVertical: 15,
alignItems: 'center',
marginBottom: 15,
},
saveButtonText: {
fontSize: 16,
color: '#fff',
fontWeight: 'bold',
},
resetSettingsButton: {
backgroundColor: '#f5f5f5',
borderRadius: 10,
paddingVertical: 15,
alignItems: 'center',
marginBottom: 30,
borderWidth: 1,
borderColor: '#ddd',
},
resetSettingsButtonText: {
fontSize: 16,
color: '#666',
fontWeight: '500',
},
});

export default SettingsScreen;