export type LoginRequest = {
  studentId: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  response: string; // JWT token
};

export type User = {
  studentId: string;
  role: string;
};