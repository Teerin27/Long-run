export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  displayName?: string;
}

export interface UpdateUserDto {
  displayName?: string;
}
