import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const AlarmApp = () => {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const alarmTime = await AsyncStorage.getItem("alarmTime");
      if (alarmTime) {
        const currentTime = new Date().getTime();
        if (parseInt(alarmTime) <= currentTime) {
          Speech.speak("Hi, wake up!");
          await AsyncStorage.removeItem("alarmTime");
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);



  const scheduleAlarm = async () => {
    const now = new Date();
    const alarmTime = new Date(time);
    if (alarmTime <= now) {
      alert("Please select a future time");
      return;
    }
    await AsyncStorage.setItem("alarmTime", alarmTime.getTime().toString());
    Notifications.scheduleNotificationAsync({
      content: { title: "Alarm", body: "Wake up!", sound: true },
      trigger: { date: alarmTime },
    });
    alert("Alarm set!");
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.header}>
          <Text style={{ color: "#010712", fontWeight: "600", fontSize: 23, letterSpacing: 1 }}>𝗔𝗹𝗮𝗿𝗺 𝗔𝗽𝗽</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 30, marginTop: 5, backgroundColor : "#b5af9f" , height : 50, marginHorizontal : 20, borderRadius : 5}}>
          <Text style={{ fontSize: 18, fontWeight: "500" }}>Schedule Alarm</Text>
          <Button title="Pick Time" onPress={() => setShowPicker(true)} />
        </View>

        <View style={{ width: "100%", height: 550, alignItems: "center", justifyContent: "center", gap: 40 }}>
          <FontAwesome name="bell-o" size={150} color="gray" />
          <View>
            <Text style={{textAlign : "center", fontSize: 20, fontWeight: "600", color : "green"}}>Scheduled Time</Text>
            <Text style={{ fontSize: 25, fontWeight: "600", textAlign : "center" , marginTop : 20 }}>{time.toLocaleTimeString()}</Text>
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
        <View style={{ width: "50%", alignSelf: "center" }}>
          <Button title="Set Alarm" onPress={scheduleAlarm} />
        </View>
      </View>
    </>
  );
};

export default AlarmApp;

let styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    backgroundColor: "white",
    padding: 10

  }
})
