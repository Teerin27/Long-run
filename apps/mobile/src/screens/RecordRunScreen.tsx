import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GpsPoint } from "@long-run/shared";
import type { MainStackParamList } from "../navigation/MainStack";
import {
  haversineMeters,
  requestLocationPermission,
  watchPosition,
} from "../services/locationService";
import { createActivity } from "../services/activitiesService";
import { formatDistanceKm, formatDuration } from "../utils/format";

type Props = NativeStackScreenProps<MainStackParamList, "RecordRun">;

type LocationSubscription = Awaited<ReturnType<typeof watchPosition>>;

export function RecordRunScreen({ navigation }: Props) {
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [pointCount, setPointCount] = useState(0);

  const pointsRef = useRef<GpsPoint[]>([]);
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string | null>(null);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => stopTracking, [stopTracking]);

  async function handleStart() {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert("Location permission required", "Long-run needs location access to track your run.");
      return;
    }

    pointsRef.current = [];
    setDistanceMeters(0);
    setElapsedSeconds(0);
    setPointCount(0);
    startedAtRef.current = new Date().toISOString();

    subscriptionRef.current = await watchPosition((point) => {
      const previous = pointsRef.current[pointsRef.current.length - 1];
      if (previous) {
        setDistanceMeters((current) => current + haversineMeters(previous, point));
      }
      pointsRef.current = [...pointsRef.current, point];
      setPointCount(pointsRef.current.length);
    });

    timerRef.current = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    setRecording(true);
  }

  async function handleFinish() {
    stopTracking();
    setRecording(false);

    if (pointsRef.current.length < 2) {
      Alert.alert("Run too short", "Not enough GPS points were recorded to save this run.");
      return;
    }

    setSubmitting(true);
    try {
      await createActivity({
        startedAt: startedAtRef.current ?? new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationSeconds: elapsedSeconds,
        points: pointsRef.current,
      });
      navigation.replace("Activities");
    } catch (err) {
      Alert.alert("Couldn't save run", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 justify-between bg-white px-6 py-10">
      <View className="items-center">
        <Text className="mb-2 text-6xl font-bold">{formatDuration(elapsedSeconds)}</Text>
        <Text className="text-xl text-gray-600">{formatDistanceKm(distanceMeters)}</Text>
        {recording ? (
          <Text className="mt-2 text-sm text-gray-400">{pointCount} GPS points recorded</Text>
        ) : null}
      </View>

      {recording ? (
        <TouchableOpacity
          className="rounded-lg bg-red-600 py-4"
          onPress={handleFinish}
          disabled={submitting}
        >
          <Text className="text-center text-lg font-semibold text-white">
            {submitting ? "Saving…" : "Finish run"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity className="rounded-lg bg-black py-4" onPress={handleStart}>
          <Text className="text-center text-lg font-semibold text-white">Start run</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
