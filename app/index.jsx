import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Task Name for Background Fetch
const ALARM_TASK = "CHECK_ALARM_TASK";

// Register Background Task
TaskManager.defineTask(ALARM_TASK, async () => {
  const alarmTime = await AsyncStorage.getItem("alarmTime");
  if (alarmTime) {
    const currentTime = new Date().getTime();
    if (parseInt(alarmTime) <= currentTime) {
      Speech.speak("Hi, wake up!");
      await Notifications.scheduleNotificationAsync({
        content: { title: "Alarm", body: "Wake up!", sound: true },
        trigger: null, // Send notification immediately
      });
      await AsyncStorage.removeItem("alarmTime"); // Remove alarm after triggering
    }
  }
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

const AlarmApp = () => {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    registerBackgroundTask();
  }, []);

  const registerBackgroundTask = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      await BackgroundFetch.registerTaskAsync(ALARM_TASK, {
        minimumInterval: 60, // Check every 60 seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  };

  const scheduleAlarm = async () => {
    const now = new Date();
    const alarmTime = new Date(time);
    if (alarmTime <= now) {
      alert("Please select a future time");
      return;
    }
    await AsyncStorage.setItem("alarmTime", alarmTime.getTime().toString());
    alert("Alarm set!");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.header}>
        <Text style={styles.title}>𝗔𝗹𝗮𝗿𝗺 𝗔𝗽𝗽</Text>
      </View>
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleText}>Schedule Alarm</Text>
        <Button title="Pick Time" onPress={() => setShowPicker(true)} />
      </View>

      <View style={styles.content}>
        <FontAwesome name="bell-o" size={150} color="gray" />
        <View>
          <Text style={styles.scheduledText}>Scheduled Time</Text>
          <Text style={styles.timeText}>{time.toLocaleTimeString()}</Text>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setTime(selectedDate);
          }}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Set Alarm" onPress={scheduleAlarm} />
      </View>
    </View>
  );
};

export default AlarmApp;

// Styles
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    backgroundColor: "white",
    padding: 10,
  },
  title: {
    color: "#010712",
    fontWeight: "600",
    fontSize: 23,
    letterSpacing: 1,
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    marginTop: 5,
    backgroundColor: "#b5af9f",
    height: 50,
    marginHorizontal: 20,
    borderRadius: 5,
  },
  scheduleText: {
    fontSize: 18,
    fontWeight: "500",
  },
  content: {
    width: "100%",
    height: 550,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  scheduledText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "green",
  },
  timeText: {
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    width: "50%",
    alignSelf: "center",
  },
});
