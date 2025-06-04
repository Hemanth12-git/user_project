export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdOn: string;
  status: 'Active' | 'Inactive';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  totalCount?: number;
}