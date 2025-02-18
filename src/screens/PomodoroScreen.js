// screens/PomodoroScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Vibration,
  ScrollView,
  Dimensions,
  Animated 
} from 'react-native';
// Using react-native-heroicons instead of MaterialCommunityIcons
import { ArrowLeftIcon, AdjustmentsHorizontalIcon, RefreshIcon, PlayIcon, PauseIcon, FastForwardIcon, LightBulbIcon, CoffeeIcon, ClipboardListIcon } from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Using react-native-sound instead of expo-av
import Sound from 'react-native-sound';
// Using react-native-circular-progress for the timer circle
import { CircularProgressBase } from 'react-native-circular-progress-indicator';

// Default timer settings
const DEFAULT_POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const DEFAULT_SHORT_BREAK_TIME = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK_TIME = 15 * 60; // 15 minutes
const DEFAULT_POMODORO_COUNT = 4; // Number of pomodoros before a long break

// Enable sound playback in silent mode
Sound.setCategory('Playback');

const PomodoroScreen = ({ navigation, route }) => {
  // Selected task if coming from task list
  const selectedTask = route.params?.task;
  
  // Timer state
  const [seconds, setSeconds] = useState(DEFAULT_POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState(selectedTask || null);
  
  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  
  // Settings
  const [settings, setSettings] = useState({
    pomodoroTime: DEFAULT_POMODORO_TIME,
    shortBreakTime: DEFAULT_SHORT_BREAK_TIME,
    longBreakTime: DEFAULT_LONG_BREAK_TIME,
    pomodoroCount: DEFAULT_POMODORO_COUNT,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  
  // Sound ref
  const soundRef = useRef(null);
  
  // Load sound
  useEffect(() => {
    soundRef.current = new Sound('complete.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load sound', error);
      }
    });
    
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);
  
  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('pomodoroSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
          
          // Reset timer based on current mode and loaded settings
          if (timerMode === 'pomodoro') {
            setSeconds(parsedSettings.pomodoroTime);
          } else if (timerMode === 'shortBreak') {
            setSeconds(parsedSettings.shortBreakTime);
          } else {
            setSeconds(parsedSettings.longBreakTime);
          }
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Timer logic
  useEffect(() => {
    let interval = null;
    let animationInstance = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          if (seconds <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
      
      // Breathing animation when active
      animationInstance = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      clearInterval(interval);
      if (animationInstance) {
        animationInstance.stop();
      }
    }
    
    return () => {
      clearInterval(interval);
      if (animationInstance) {
        animationInstance.stop();
      }
    };
  }, [isActive, seconds]);
  
  const handleTimerComplete = async () => {
    // Play sound if enabled
    if (settings.soundEnabled && soundRef.current) {
      soundRef.current.play();
    }
    
    // Vibrate if enabled
    if (settings.vibrationEnabled) {
      Vibration.vibrate([500, 1000, 500]);
    }
    
    if (timerMode === 'pomodoro') {
      const newCompletedCount = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedCount);
      
      // Update stats
      updateStats();
      
      // Update task completion if applicable
      if (currentTask) {
        await updateTaskProgress(currentTask.id);
      }
      
      // Determine next break type
      if (newCompletedCount % settings.pomodoroCount === 0) {
        Alert.alert('Pomodoro Complete!', 'Time for a long break. Great job!');
        switchMode('longBreak');
      } else {
        Alert.alert('Pomodoro Complete!', 'Take a short break.');
        switchMode('shortBreak');
      }
    } else if (timerMode === 'shortBreak') {
      Alert.alert('Break Complete!', 'Ready for another pomodoro?');
      switchMode('pomodoro');
    } else { // longBreak
      Alert.alert('Long Break Complete!', 'Ready to start a new pomodoro set?');
      setCompletedPomodoros(0); // Reset count after a long break
      switchMode('pomodoro');
    }
  };
  
  const updateStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem('pomodoroStats');
      let stats = storedStats ? JSON.parse(storedStats) : {
        totalPomodorosCompleted: 0,
        totalMinutesFocused: 0,
        currentStreak: 0,
      };
      
      // Update stats
      stats.totalPomodorosCompleted += 1;
      stats.totalMinutesFocused += Math.floor(settings.pomodoroTime / 60);
      
      // Update streak logic (simplified - in a real app would check date)
      stats.currentStreak += 1;
      
      await AsyncStorage.setItem('pomodoroStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update stats', error);
    }
  };
  
  const updateTaskProgress = async (taskId) => {
    try {
      const storedTasks = await AsyncStorage.getItem('pomodoro_tasks');
      if (storedTasks) {
        let tasks = JSON.parse(storedTasks);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          tasks[taskIndex].completedPomodoros += 1;
          
          // Mark as completed if all pomodoros are done
          if (tasks[taskIndex].completedPomodoros >= tasks[taskIndex].estimatedPomodoros) {
            tasks[taskIndex].isCompleted = true;
          }
          
          await AsyncStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
          
          // Update current task state
          setCurrentTask({
            ...currentTask,
            completedPomodoros: tasks[taskIndex].completedPomodoros,
            isCompleted: tasks[taskIndex].isCompleted
          });
        }
      }
    } catch (error) {
      console.error('Failed to update task progress', error);
    }
  };
  
  const switchMode = (mode) => {
    setIsActive(false);
    setTimerMode(mode);
    
    if (mode === 'pomodoro') {
      setSeconds(settings.pomodoroTime);
    } else if (mode === 'shortBreak') {
      setSeconds(settings.shortBreakTime);
    } else { // longBreak
      setSeconds(settings.longBreakTime);
    }
  };
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    if (timerMode === 'pomodoro') {
      setSeconds(settings.pomodoroTime);
    } else if (timerMode === 'shortBreak') {
      setSeconds(settings.shortBreakTime);
    } else {
      setSeconds(settings.longBreakTime);
    }
  };
  
  const skipTimer = () => {
    Alert.alert(
      'Skip Timer',
      'Are you sure you want to skip the current timer?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setSeconds(0);
            setIsActive(false);
            handleTimerComplete();
          },
        },
      ],
    );
  };
  
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    switch (timerMode) {
      case 'pomodoro':
        return '#F44336';
      case 'shortBreak':
        return '#4CAF50';
      case 'longBreak':
        return '#2196F3';
      default:
        return '#F44336';
    }
  };
  
  const getMaxTime = () => {
    if (timerMode === 'pomodoro') {
      return settings.pomodoroTime;
    } else if (timerMode === 'shortBreak') {
      return settings.shortBreakTime;
    } else {
      return settings.longBreakTime;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {timerMode === 'pomodoro' ? 'Focus Time' : 
           timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <AdjustmentsHorizontalIcon size={28} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {currentTask && (
          <View style={styles.currentTaskContainer}>
            <Text style={styles.currentTaskLabel}>Current Task:</Text>
            <Text style={styles.currentTaskTitle}>{currentTask.title}</Text>
            <View style={styles.taskProgressContainer}>
              <Text style={styles.taskProgressText}>
                {currentTask.completedPomodoros} / {currentTask.estimatedPomodoros} pomodoros
              </Text>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    {
                      width: `${(currentTask.completedPomodoros / currentTask.estimatedPomodoros) * 100}%`,
                      backgroundColor: getTimerColor()
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.timerModeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              timerMode === 'pomodoro' && styles.activeMode,
              timerMode === 'pomodoro' && { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
            ]}
            onPress={() => switchMode('pomodoro')}
          >
            <Text style={[
              styles.modeButtonText,
              timerMode === 'pomodoro' && { color: '#F44336' }
            ]}>Pomodoro</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              timerMode === 'shortBreak' && styles.activeMode,
              timerMode === 'shortBreak' && { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
            ]}
            onPress={() => switchMode('shortBreak')}
          >
            <Text style={[
              styles.modeButtonText,
              timerMode === 'shortBreak' && { color: '#4CAF50' }
            ]}>Short Break</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              timerMode === 'longBreak' && styles.activeMode,
              timerMode === 'longBreak' && { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
            ]}
            onPress={() => switchMode('longBreak')}
          >
            <Text style={[
              styles.modeButtonText,
              timerMode === 'longBreak' && { color: '#2196F3' }
            ]}>Long Break</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timerContainer}>
          <Animated.View 
            style={[
              styles.timerCircleContainer,
              {
                transform: [{ scale: breatheAnim }],
              }
            ]}
          >
            <CircularProgressBase
              value={getMaxTime() - seconds}
              maxValue={getMaxTime()}
              radius={width * 0.35}
              activeStrokeWidth={10}
              inActiveStrokeWidth={10}
              activeStrokeColor={getTimerColor()}
              inActiveStrokeColor={'rgba(0, 0, 0, 0.05)'}
              circleBackgroundColor={'#fff'}
            >
              <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                <Text style={styles.pomodoroCount}>
                  {timerMode === 'pomodoro' ? 
                    `${completedPomodoros}/${settings.pomodoroCount} completed` : 
                    timerMode === 'shortBreak' ? 'Take a short break' : 'Take a long break'}
                </Text>
              </View>
            </CircularProgressBase>
          </Animated.View>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetTimer}
          >
            <RefreshIcon size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.mainButton,
              { backgroundColor: getTimerColor() }
            ]}
            onPress={toggleTimer}
          >
            {isActive ? (
              <PauseIcon size={36} color="#fff" />
            ) : (
              <PlayIcon size={36} color="#fff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.skipButton]}
            onPress={skipTimer}
          >
            <FastForwardIcon size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {!currentTask && (
          <TouchableOpacity 
            style={styles.selectTaskButton}
            onPress={() => navigation.navigate('TaskList', { selectMode: true })}
          >
            <ClipboardListIcon size={20} color="#fff" />
            <Text style={styles.selectTaskButtonText}>Select a Task</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.tipsContainer}>
          {timerMode === 'pomodoro' ? (
            <View style={styles.tipCard}>
              <LightBulbIcon size={24} color="#F44336" />
              <Text style={styles.tipTitle}>Focus Tip:</Text>
              <Text style={styles.tipContent}>
                Clear your workspace and silence notifications to remove distractions. Focus on just one task for maximum efficiency.
              </Text>
            </View>
          ) : (
            <View style={styles.tipCard}>
              <CoffeeIcon size={24} color={timerMode === 'shortBreak' ? '#4CAF50' : '#2196F3'} />
              <Text style={styles.tipTitle}>Break Tip:</Text>
              <Text style={styles.tipContent}>
                Step away from screens. Stretch, hydrate, or take a short walk to refresh your mind before the next session.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

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
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  currentTaskContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  currentTaskLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentTaskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  taskProgressContainer: {
    marginTop: 5,
  },
  taskProgressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  timerModeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    width: '100%',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeMode: {
    borderRadius: 6,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pomodoroCount: {
    fontSize: 14,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    marginRight: 20,
  },
  mainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  skipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    marginLeft: 20,
  },
  selectTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectTaskButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 10,
  },
  tipsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
    color: '#333',
  },
  tipContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PomodoroScreen;