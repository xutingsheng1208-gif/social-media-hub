import { create } from 'zustand';
import { Content, Category, Tag, SearchFilters } from '../types';
import { contentApi, categoryApi, tagApi } from '../services/api';

interface ContentStore {
  // 状态
  contents: Content[];
  categories: Category[];
  tags: Tag[];
  currentContent: Content | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: SearchFilters;

  // 操作
  fetchContents: (params?: SearchFilters & { page?: number; limit?: number }) => Promise<void>;
  searchContents: (query: string, page?: number) => Promise<void>;
  fetchContent: (id: number) => Promise<void>;
  createContent: (data: Partial<Content>) => Promise<void>;
  updateContent: (id: number, data: Partial<Content>) => Promise<void>;
  deleteContent: (id: number) => Promise<void>;
  batchDeleteContents: (ids: number[]) => Promise<void>;

  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; parentId?: number }) => Promise<void>;
  updateCategory: (id: number, data: { name?: string; parentId?: number }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  fetchTags: () => Promise<void>;
  createTag: (data: { name: string }) => Promise<void>;

  setFilters: (filters: SearchFilters) => void;
  clearError: () => void;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  // 初始状态
  contents: [],
  categories: [],
  tags: [],
  currentContent: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {},

  // 获取内容列表
  fetchContents: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await contentApi.getContents({
        ...get().filters,
        ...params,
      });
      set({
        contents: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // 搜索内容
  searchContents: async (query, page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await contentApi.searchContents({ q: query, page });
      set({
        contents: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // 获取单个内容
  fetchContent: async (id) => {
    set({ loading: true, error: null });
    try {
      const content = await contentApi.getContent(id);
      set({ currentContent: content, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // 创建内容
  createContent: async (data) => {
    set({ loading: true, error: null });
    try {
      const content = await contentApi.createContent(data);
      set(state => ({
        contents: [content, ...state.contents],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  // 更新内容
  updateContent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const content = await contentApi.updateContent(id, data);
      set(state => ({
        contents: state.contents.map(c => c.id === id ? content : c),
        currentContent: state.currentContent?.id === id ? content : state.currentContent,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  // 删除内容
  deleteContent: async (id) => {
    set({ loading: true, error: null });
    try {
      await contentApi.deleteContent(id);
      set(state => ({
        contents: state.contents.filter(c => c.id !== id),
        currentContent: state.currentContent?.id === id ? null : state.currentContent,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  // 批量删除内容
  batchDeleteContents: async (ids) => {
    set({ loading: true, error: null });
    try {
      await contentApi.batchDeleteContents(ids);
      set(state => ({
        contents: state.contents.filter(c => !ids.includes(c.id)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  // 获取分类列表
  fetchCategories: async () => {
    try {
      const categories = await categoryApi.getCategories();
      set({ categories });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // 创建分类
  createCategory: async (data) => {
    try {
      const category = await categoryApi.createCategory(data);
      set(state => ({
        categories: [...state.categories, category],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // 更新分类
  updateCategory: async (id, data) => {
    try {
      const category = await categoryApi.updateCategory(id, data);
      set(state => ({
        categories: state.categories.map(c => c.id === id ? category : c),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // 删除分类
  deleteCategory: async (id) => {
    try {
      await categoryApi.deleteCategory(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // 获取标签列表
  fetchTags: async () => {
    try {
      const response = await tagApi.getTags({ limit: 100 });
      set({ tags: response.data });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // 创建标签
  createTag: async (data) => {
    try {
      const tag = await tagApi.createTag(data);
      set(state => ({
        tags: [...state.tags, tag],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // 设置筛选条件
  setFilters: (filters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));