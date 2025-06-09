const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface LoginResponse {
  message: string;
  token: string;
  user: any;
  expires_in: number;
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password }),
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
