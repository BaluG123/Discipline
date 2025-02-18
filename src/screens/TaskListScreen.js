// screens/TaskListScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskListScreen = ({ navigation, route }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'completed'
  const selectMode = route.params?.selectMode || false;

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, filterMode]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('pomodoro_tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const filterTasks = () => {
    let result = [...tasks];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterMode !== 'all') {
      result = result.filter(task => 
        filterMode === 'completed' ? task.isCompleted : !task.isCompleted
      );
    }
    
    setFilteredTasks(result);
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const updatedTasks = tasks.filter(task => task.id !== taskId);
              await AsyncStorage.setItem('pomodoro_tasks', JSON.stringify(updatedTasks));
              setTasks(updatedTasks);
            } catch (error) {
              console.error('Failed to delete task', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleSelectTask = (task) => {
    if (selectMode) {
      navigation.navigate('Pomodoro', { task });
    } else {
      navigation.navigate('TaskForm', { 
        taskId: task.id,
        mode: 'edit'
      });
    }
  };

  const renderTask = ({ item }) => {
    const progressPercentage = item.estimatedPomodoros > 0 
      ? (item.completedPomodoros / item.estimatedPomodoros) * 100 
      : 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          item.isCompleted && styles.completedTask
        ]}
        onPress={() => handleSelectTask(item)}
      >
        <View style={styles.taskHeader}>
          <Text style={[
            styles.taskTitle,
            item.isCompleted && styles.completedTaskText
          ]}>
            {item.title}
          </Text>
          
          {!selectMode && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTask(item.id)}
            >
              <Icon name="delete-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text 
          style={[
            styles.taskDescription,
            item.isCompleted && styles.completedTaskText
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        
        <View style={styles.taskProgressContainer}>
          <Text style={styles.taskProgressText}>
            {item.completedPomodoros} / {item.estimatedPomodoros} pomodoros
          </Text>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` },
                item.isCompleted && styles.completedProgressBar
              ]} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectMode ? 'Select a Task' : 'My Tasks'}
        </Text>
        {!selectMode && (
          <TouchableOpacity onPress={() => navigation.navigate('TaskForm', { mode: 'add' })}>
            <Icon name="plus" size={28} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filterMode === 'all' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filterMode === 'all' && styles.activeFilterText
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filterMode === 'active' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('active')}
        >
          <Text style={[
            styles.filterButtonText,
            filterMode === 'active' && styles.activeFilterText
          ]}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filterMode === 'completed' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('completed')}
        >
          <Text style={[
            styles.filterButtonText,
            filterMode === 'completed' && styles.activeFilterText
          ]}>Completed</Text>
        </TouchableOpacity>
      </View>
      
      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.taskList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-text-outline" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No tasks found</Text>
          {!selectMode && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('TaskForm', { mode: 'add' })}
            >
              <Text style={styles.emptyButtonText}>Create a New Task</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeFilter: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#F44336',
  },
  taskList: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  completedTask: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  completedTaskText: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskProgressContainer: {
    marginTop: 8,
  },
  taskProgressText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F44336',
  },
  completedProgressBar: {
    backgroundColor: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TaskListScreen;