import { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { LeaderboardEntry, LeaderboardWindow } from "@long-run/shared";
import { getLeaderboard, getMyRank } from "../services/leaderboardService";
import { formatDistanceKm } from "../utils/format";

const WINDOWS: { label: string; value: LeaderboardWindow }[] = [
  { label: "Today", value: "daily" },
  { label: "This week", value: "weekly" },
  { label: "All time", value: "alltime" },
];

export function LeaderboardScreen() {
  const [window, setWindow] = useState<LeaderboardWindow>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (selectedWindow: LeaderboardWindow) => {
    setLoading(true);
    try {
      const [top, mine] = await Promise.all([getLeaderboard(selectedWindow), getMyRank(selectedWindow)]);
      setEntries(top);
      setMyRank(mine);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(window);
    }, [load, window]),
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-around border-b border-gray-200 px-4 py-3">
        {WINDOWS.map((option) => (
          <TouchableOpacity key={option.value} onPress={() => setWindow(option.value)}>
            <Text className={window === option.value ? "font-bold text-black" : "text-gray-400"}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {myRank ? (
        <View className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <Text className="text-gray-600">
            Your rank: #{myRank.rank} · {formatDistanceKm(myRank.distanceMeters)}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(window)} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-10 text-center text-gray-500">No runs logged in this window yet.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="mb-2 flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
            <Text className="font-semibold">
              #{item.rank} {item.displayName ?? "Anonymous runner"}
            </Text>
            <Text className="text-gray-600">{formatDistanceKm(item.distanceMeters)}</Text>
          </View>
        )}
      />
    </View>
  );
}
