// screens/TaskFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const TaskFormScreen = ({ navigation, route }) => {
  const isEditMode = route.params?.mode === 'edit';
  const taskId = route.params?.taskId;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [priority, setPriority] = useState('medium'); // 'low', 'medium', 'high'
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState(null);
  
  useEffect(() => {
    if (isEditMode && taskId) {
      loadTaskDetails();
    }
  }, [isEditMode, taskId]);
  
  const loadTaskDetails = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('pomodoro_tasks');
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
          setTitle(task.title);
          setDescription(task.description || '');
          setEstimatedPomodoros(task.estimatedPomodoros);
          setPriority(task.priority || 'medium');
          setIsCompleted(task.isCompleted || false);
          setNotes(task.notes || '');
          setDeadline(task.deadline);
        }
      }
    } catch (error) {
      console.error('Failed to load task details', error);
    }
  };
  
  const handleSave = async () => {
    // Validate input
    if (!title.trim()) {
      Alert.alert('Invalid Input', 'Task title cannot be empty');
      return;
    }
    
    try {
      const newTask = {
        id: isEditMode ? taskId : uuidv4(),
        title,
        description,
        estimatedPomodoros,
        completedPomodoros: isEditMode ? undefined : 0,
        priority,
        isCompleted,
        notes,
        deadline,
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Get current tasks
      const storedTasks = await AsyncStorage.getItem('pomodoro_tasks');
      let tasks = storedTasks ? JSON.parse(storedTasks) : [];
      
      if (isEditMode) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          // Preserve completed pomodoros count
          newTask.completedPomodoros = tasks[taskIndex].completedPomodoros;
          tasks[taskIndex] = { ...tasks[taskIndex], ...newTask };
        }
      } else {
        // Add new task
        tasks.push(newTask);
      }
      
      // Save updated tasks
      await AsyncStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save task', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };
  
  const decrementPomodoros = () => {
    if (estimatedPomodoros > 1) {
      setEstimatedPomodoros(estimatedPomodoros - 1);
    }
  };
  
  const incrementPomodoros = () => {
    setEstimatedPomodoros(estimatedPomodoros + 1);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Icon name="check" size={28} color="#F44336" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          maxLength={50}
        />
        
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your task (optional)"
          multiline
          maxLength={200}
        />
        
        <Text style={styles.label}>Estimated Pomodoros</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={decrementPomodoros}
          >
            <Icon name="minus" size={20} color={estimatedPomodoros > 1 ? '#F44336' : '#ccc'} />
          </TouchableOpacity>
          
          <Text style={styles.counterValue}>{estimatedPomodoros}</Text>
          
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={incrementPomodoros}
          >
            <Icon name="plus" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          <TouchableOpacity
            style={[
              styles.priorityButton,
              priority === 'low' && styles.activePriorityLow
            ]}
            onPress={() => setPriority('low')}
          >
            <Icon 
              name="flag-outline" 
              size={20} 
              color={priority === 'low' ? '#4CAF50' : '#666'} 
            />
            <Text style={[
              styles.priorityText,
              priority === 'low' && { color: '#4CAF50' }
            ]}>Low</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.priorityButton,
              priority === 'medium' && styles.activePriorityMedium
            ]}
            onPress={() => setPriority('medium')}
          >
            <Icon 
              name="flag-outline" 
              size={20} 
              color={priority === 'medium' ? '#FF9800' : '#666'} 
            />
            <Text style={[
              styles.priorityText,
              priority === 'medium' && { color: '#FF9800' }
            ]}>Medium</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.priorityButton,
              priority === 'high' && styles.activePriorityHigh
            ]}
            onPress={() => setPriority('high')}
          >
            <Icon 
              name="flag-outline" 
              size={20} 
              color={priority === 'high' ? '#F44336' : '#666'} 
            />
            <Text style={[
              styles.priorityText,
              priority === 'high' && { color: '#F44336' }
            ]}>High</Text>
          </TouchableOpacity>
        </View>
        
        {isEditMode && (
          <View style={styles.completedContainer}>
            <Text style={styles.label}>Mark as Completed</Text>
            <Switch
              value={isCompleted}
              onValueChange={setIsCompleted}
              trackColor={{ false: '#ddd', true: 'rgba(76, 175, 80, 0.4)' }}
              thumbColor={isCompleted ? '#4CAF50' : '#f5f5f5'}
            />
          </View>
        )}
        
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any additional notes (optional)"
          multiline
          maxLength={500}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </Text>
          </TouchableOpacity>
          
          {isEditMode && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 4,
  },
  priorityText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#666',
  },
  activePriorityLow: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  activePriorityMedium: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#FF9800',
  },
  activePriorityHigh: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TaskFormScreen;