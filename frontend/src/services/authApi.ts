import { AxiosInstance } from 'axios';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RegisterResponse extends LoginResponse {}

export class AuthApi {
  constructor(private api: AxiosInstance) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<RegisterResponse> {
    const response = await this.api.post<RegisterResponse>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<LoginResponse['user']> {
    const response = await this.api.get<LoginResponse>('/auth/me');
    return response.data.user;
  }
} 