export interface Service {
  id: string;
  title: string;
  description: string;
  freelancerId: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
    totalProjects: number;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  serviceCount: number;
  subcategories: string[];
}