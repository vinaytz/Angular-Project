export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'client';
  avatar?: string;
  title?: string;
  rating?: number;
  totalProjects?: number;
  totalEarnings?: number;
  skills?: string[];
  experience?: Experience[];
  isOnline?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'client';
}