export interface Content {
  id: number;
  title: string;
  description?: string;
  sourcePlatform: 'douyin' | 'xiaohongshu';
  sourceUrl?: string;
  contentType: 'video' | 'image' | 'text';
  filePath?: string;
  thumbnailPath?: string;
  tags: string[];
  categoryId?: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    contents: number;
  };
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  _count?: {
    contents: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ExtractPreview {
  title: string;
  description: string;
  author: string;
  tags: string[];
  images?: string[];
  videoUrl?: string;
  createdAt: Date;
}

export interface SearchFilters {
  search?: string;
  platform?: string;
  category?: number;
  tags?: string[];
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
  };
  message?: string;
}