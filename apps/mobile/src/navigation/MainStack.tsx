import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainScreen } from "../screens/MainScreen";
import { RecordRunScreen } from "../screens/RecordRunScreen";
import { ActivitiesListScreen } from "../screens/ActivitiesListScreen";
import { LeaderboardScreen } from "../screens/LeaderboardScreen";

export type MainStackParamList = {
  Main: undefined;
  RecordRun: undefined;
  Activities: undefined;
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainScreen} options={{ title: "Long-run" }} />
      <Stack.Screen name="RecordRun" component={RecordRunScreen} options={{ title: "Record run" }} />
      <Stack.Screen name="Activities" component={ActivitiesListScreen} options={{ title: "My runs" }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: "Leaderboard" }} />
    </Stack.Navigator>
  );
}
