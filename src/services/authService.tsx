import { sha256 } from 'js-sha256';
import { API_BASE_URL } from "../config.ts";

export interface LoginResponse {
  message: string;
  token: string;
  expires_in: number;
}

export interface RegisterPayload {
  student_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  gender: string;
  email: string;
  contact_number: string;
  password: string;
}

export async function loginUser(username: string, password: string) {
  const hashed_password = sha256(password)
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: hashed_password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Login failed');
  }
  return json.data;
}

export async function registerUser(data: RegisterPayload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Registration error:', err.message);
    throw err;
  }
}
