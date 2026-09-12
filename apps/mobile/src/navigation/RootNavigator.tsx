import { NavigationContainer } from "@react-navigation/native";
import { Text, View } from "react-native";
import { useAuth } from "../store/AuthContext";
import { AuthStack } from "./AuthStack";
import { MainStack } from "./MainStack";

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>{user ? <MainStack /> : <AuthStack />}</NavigationContainer>
  );
}
