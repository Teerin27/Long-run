import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";

export async function signUp(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export function signOut() {
  return firebaseSignOut(firebaseAuth);
}
