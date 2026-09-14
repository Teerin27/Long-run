import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../store/AuthContext";
import type { AuthStackParamList } from "../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-6 text-2xl font-bold">Create your account</Text>

      <TextInput
        className="mb-3 rounded-lg border border-gray-300 px-4 py-3"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="mb-3 rounded-lg border border-gray-300 px-4 py-3"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text className="mb-3 text-red-500">{error}</Text> : null}

      <TouchableOpacity
        className="mb-3 rounded-lg bg-black py-3"
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text className="text-center font-semibold text-white">
          {submitting ? "Creating account…" : "Sign up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
        <Text className="text-center text-gray-600">
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
}
