export interface User {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
