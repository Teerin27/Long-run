import { Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../store/AuthContext";
import type { MainStackParamList } from "../navigation/MainStack";

type Props = NativeStackScreenProps<MainStackParamList, "Main">;

export function MainScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold">Welcome back</Text>
      <Text className="mb-6 text-gray-600">{user?.email}</Text>

      <TouchableOpacity
        className="mb-3 rounded-lg bg-black py-3"
        onPress={() => navigation.navigate("RecordRun")}
      >
        <Text className="text-center font-semibold text-white">Start a run</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-6 rounded-lg border border-gray-300 py-3"
        onPress={() => navigation.navigate("Activities")}
      >
        <Text className="text-center font-semibold text-black">My runs</Text>
      </TouchableOpacity>

      <TouchableOpacity className="rounded-lg bg-black py-3" onPress={signOut}>
        <Text className="text-center font-semibold text-white">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
