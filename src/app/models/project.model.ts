export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  price: number;
  deadline: Date;
  progress: number;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  freelancer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  price: number;
  deadline: Date;
  skills: string[];
}