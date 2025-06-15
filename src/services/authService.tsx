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
  campus: string;
  department: string;
  course: string;
  year: string;
}


export async function loginUser(email: string, password: string) {

  try {

    const hashed_password = sha256(password)

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, hashed_password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error((error as Error).message || 'An unexpected error occurred');
  }
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
