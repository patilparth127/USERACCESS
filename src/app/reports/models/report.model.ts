export interface Report {
  id?: number;
  name: string;
  type: string;
  description: string;
  status: 'Active' | 'Draft' | 'Archived';
  isActive: boolean;
  image?: string; // Base64 encoded image
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportRequest {
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  image?: string; // Base64 encoded image
}

export interface UpdateReportRequest {
  name?: string;
  type?: string;
  description?: string;
  status?: 'Active' | 'Draft' | 'Archived';
  isActive?: boolean;
  image?: string; // Base64 encoded image
}
