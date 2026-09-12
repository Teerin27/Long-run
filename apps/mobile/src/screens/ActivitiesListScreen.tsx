import { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Activity } from "@long-run/shared";
import type { MainStackParamList } from "../navigation/MainStack";
import { listActivities } from "../services/activitiesService";
import { formatDistanceKm, formatDuration, formatPaceMinPerKm } from "../utils/format";

type Props = NativeStackScreenProps<MainStackParamList, "Activities">;

export function ActivitiesListScreen({ navigation }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setActivities(await listActivities());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-10 text-center text-gray-500">
              No runs yet — start one from the home screen.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg border border-gray-200 p-4">
            <Text className="mb-1 text-lg font-semibold">
              {new Date(item.startedAt).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">{formatDistanceKm(item.distanceMeters)}</Text>
              <Text className="text-gray-600">{formatDuration(item.durationSeconds)}</Text>
              <Text className="text-gray-600">
                {formatPaceMinPerKm(item.distanceMeters, item.durationSeconds)}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        className="mx-6 mb-6 rounded-lg bg-black py-3"
        onPress={() => navigation.navigate("RecordRun")}
      >
        <Text className="text-center font-semibold text-white">Start a new run</Text>
      </TouchableOpacity>
    </View>
  );
}
