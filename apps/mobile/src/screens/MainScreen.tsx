import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../store/AuthContext";

export function MainScreen() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold">Welcome back</Text>
      <Text className="mb-6 text-gray-600">{user?.email}</Text>

      <TouchableOpacity className="rounded-lg bg-black py-3" onPress={signOut}>
        <Text className="text-center font-semibold text-white">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
