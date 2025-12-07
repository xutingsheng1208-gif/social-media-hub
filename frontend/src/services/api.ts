import axios from 'axios';
import { Content, Category, Tag, PaginatedResponse, SearchFilters, ExtractPreview } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 内容相关API
export const contentApi = {
  // 获取内容列表
  getContents: (params: SearchFilters & { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Content>>('/content', { params }),

  // 搜索内容
  searchContents: (params: { q: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Content>>('/content/search', { params }),

  // 获取单个内容
  getContent: (id: number) =>
    api.get<Content>(`/content/${id}`),

  // 创建内容
  createContent: (data: Partial<Content>) =>
    api.post<Content>('/content', data),

  // 更新内容
  updateContent: (id: number, data: Partial<Content>) =>
    api.put<Content>(`/content/${id}`, data),

  // 删除内容
  deleteContent: (id: number) =>
    api.delete(`/content/${id}`),

  // 批量删除内容
  batchDeleteContents: (ids: number[]) =>
    api.post('/content/batch-delete', { ids }),
};

// 分类相关API
export const categoryApi = {
  // 获取所有分类
  getCategories: () =>
    api.get<Category[]>('/categories'),

  // 获取单个分类
  getCategory: (id: number) =>
    api.get<Category>(`/categories/${id}`),

  // 创建分类
  createCategory: (data: { name: string; parentId?: number }) =>
    api.post<Category>('/categories', data),

  // 更新分类
  updateCategory: (id: number, data: { name?: string; parentId?: number }) =>
    api.put<Category>(`/categories/${id}`, data),

  // 删除分类
  deleteCategory: (id: number) =>
    api.delete(`/categories/${id}`),

  // 获取分类统计
  getCategoryStats: () =>
    api.get(`/categories/stats`),
};

// 标签相关API
export const tagApi = {
  // 获取所有标签
  getTags: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Tag>>('/tags', { params }),

  // 获取热门标签
  getPopularTags: (limit?: number) =>
    api.get<Tag[]>('/tags/popular', { params: { limit } }),

  // 获取单个标签
  getTag: (id: number) =>
    api.get<Tag>(`/tags/${id}`),

  // 创建标签
  createTag: (data: { name: string }) =>
    api.post<Tag>('/tags', data),

  // 批量创建标签
  batchCreateTags: (names: string[]) =>
    api.post<Tag[]>('/tags/batch', { names }),

  // 更新标签
  updateTag: (id: number, data: { name: string }) =>
    api.put<Tag>(`/tags/${id}`, data),

  // 删除标签
  deleteTag: (id: number) =>
    api.delete(`/tags/${id}`),

  // 合并标签
  mergeTags: (sourceTagId: number, targetTagId: number) =>
    api.post('/tags/merge', { sourceTagId, targetTagId }),
};

// 提取相关API
export const extractApi = {
  // 检测URL类型
  detectUrl: (url: string) =>
    api.post<{ platform: string; url: string }>('/extract/detect', { url }),

  // 预览内容
  previewContent: (url: string, platform: string) =>
    api.post<ExtractPreview>('/extract/preview', { url, platform }),

  // 提取并保存内容
  extractContent: (data: {
    url: string;
    platform: string;
    categoryId?: number;
    tags?: string[];
  }) =>
    api.post<Content>('/extract', data),
};

export default api;