// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalPomodorosCompleted: 0,
    totalMinutesFocused: 0,
    currentStreak: 0,
  });
  
  useEffect(() => {
    // Load stats from AsyncStorage
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
    
    loadStats();
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/tomato-logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>PomodoFocus</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="cog" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsOverview}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="timer-outline" size={32} color="#F44336" />
              <Text style={styles.statValue}>{stats.totalPomodorosCompleted}</Text>
              <Text style={styles.statLabel}>Pomodoros</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={32} color="#F44336" />
              <Text style={styles.statValue}>{stats.totalMinutesFocused}</Text>
              <Text style={styles.statLabel}>Minutes Focused</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fire" size={32} color="#F44336" />
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('Pomodoro')}
          >
            <Icon name="timer" size={40} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Start Pomodoro</Text>
              <Text style={styles.actionDesc}>Begin a 25-minute focused work session</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonTasks]} 
            onPress={() => navigation.navigate('TaskList')}
          >
            <Icon name="format-list-checks" size={40} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Tasks</Text>
              <Text style={styles.actionDesc}>Create and organize your task list</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Pomodoro Tips</Text>
          <View style={styles.tipCard}>
            <Icon name="lightbulb-outline" size={24} color="#F44336" />
            <Text style={styles.tipTitle}>Stay focused</Text>
            <Text style={styles.tipContent}>
              Remove all distractions during your Pomodoro. Turn off notifications and put your phone on silent.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Icon name="rest" size={24} color="#F44336" />
            <Text style={styles.tipTitle}>Respect the break</Text>
            <Text style={styles.tipContent}>
              Make sure to actually take your breaks. Stand up, stretch, and give your mind a rest.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab} onPress={() => {}}>
          <Icon name="home" size={24} color="#F44336" />
          <Text style={[styles.footerText, styles.activeFooterText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => navigation.navigate('Pomodoro')}
        >
          <Icon name="timer-outline" size={24} color="#666" />
          <Text style={styles.footerText}>Pomodoro</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => navigation.navigate('TaskList')}
        >
          <Icon name="format-list-bulleted" size={24} color="#666" />
          <Text style={styles.footerText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="cog-outline" size={24} color="#666" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    elevation: 2,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsOverview: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },
  actionButtonTasks: {
    backgroundColor: '#4CAF50',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  tipCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },
  tipContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    paddingVertical: 8,
    elevation: 8,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeFooterText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default HomeScreen;