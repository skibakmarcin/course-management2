export interface Course {
  id: string;
  title: string;
  description?: string;
  duration: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  publishedAt?: string;
}

export interface CourseFormData {
  title: string;
  description?: string;
  duration: number;
}

export interface CourseFilters {
  status: 'all' | 'draft' | 'published' | 'archived';
  search: string;
  sortBy: 'title' | 'createdAt' | 'duration';
  sortOrder: 'asc' | 'desc';
} 