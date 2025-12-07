import { Request, Response } from 'express';
import prisma from '../services/database';

export class CategoryController {
  // 获取所有分类（树形结构）
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          children: true,
          _count: {
            select: { contents: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      // 构建树形结构
      const buildTree = (categories: any[], parentId: number | null = null): any[] => {
        return categories
          .filter(category => category.parentId === parentId)
          .map(category => ({
            ...category,
            children: buildTree(categories, category.id)
          }));
      };

      const tree = buildTree(categories);

      res.json(tree);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: { message: 'Failed to get categories' } });
    }
  }

  // 获取单个分类
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: {
          parent: true,
          children: true,
          _count: {
            select: { contents: true }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: { message: 'Category not found' } });
      }

      res.json(category);
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({ error: { message: 'Failed to get category' } });
    }
  }

  // 创建分类
  async createCategory(req: Request, res: Response) {
    try {
      const { name, parentId } = req.body;

      if (!name) {
        return res.status(400).json({ error: { message: 'Category name is required' } });
      }

      // 检查父分类是否存在
      if (parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: Number(parentId) }
        });

        if (!parentCategory) {
          return res.status(400).json({ error: { message: 'Parent category not found' } });
        }

        // 检查是否超过二级分类
        if (parentCategory.parentId) {
          return res.status(400).json({ error: { message: 'Cannot create subcategory under a subcategory' } });
        }
      }

      const category = await prisma.category.create({
        data: {
          name,
          parentId: parentId ? Number(parentId) : null
        }
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: { message: 'Failed to create category' } });
    }
  }

  // 更新分类
  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, parentId } = req.body;

      // 检查分类是否存在
      const existingCategory = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: { children: true }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: { message: 'Category not found' } });
      }

      // 如果要更新父分类
      if (parentId !== undefined) {
        // 检查不能将分类设置为自己的子分类
        if (parentId && Number(parentId) === Number(id)) {
          return res.status(400).json({ error: { message: 'Cannot set category as its own parent' } });
        }

        // 检查父分类是否存在
        if (parentId) {
          const parentCategory = await prisma.category.findUnique({
            where: { id: Number(parentId) }
          });

          if (!parentCategory) {
            return res.status(400).json({ error: { message: 'Parent category not found' } });
          }

          // 检查是否超过二级分类
          if (parentCategory.parentId) {
            return res.status(400).json({ error: { message: 'Cannot create subcategory under a subcategory' } });
          }
        }

        // 如果该分类有子分类，不能将其设置为子分类
        if (parentId && existingCategory.children.length > 0) {
          return res.status(400).json({ error: { message: 'Cannot move category with children to be a subcategory' } });
        }
      }

      const category = await prisma.category.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(parentId !== undefined && { parentId: parentId ? Number(parentId) : null })
        }
      });

      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: { message: 'Failed to update category' } });
    }
  }

  // 删除分类
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 检查分类是否存在
      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: {
          children: true,
          _count: {
            select: { contents: true }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: { message: 'Category not found' } });
      }

      // 检查是否有子分类
      if (category.children.length > 0) {
        return res.status(400).json({ error: { message: 'Cannot delete category with subcategories' } });
      }

      // 检查是否有关联的内容
      if (category._count.contents > 0) {
        return res.status(400).json({
          error: {
            message: 'Cannot delete category with associated contents. Please move or delete the contents first.'
          }
        });
      }

      await prisma.category.delete({
        where: { id: Number(id) }
      });

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: { message: 'Failed to delete category' } });
    }
  }

  // 获取分类统计
  async getCategoryStats(req: Request, res: Response) {
    try {
      const stats = await prisma.category.groupBy({
        by: ['id'],
        _count: {
          contents: true
        }
      });

      const categoryStats = stats.map(stat => ({
        categoryId: stat.id,
        contentCount: stat._count.contents
      }));

      res.json(categoryStats);
    } catch (error) {
      console.error('Error getting category stats:', error);
      res.status(500).json({ error: { message: 'Failed to get category stats' } });
    }
  }
}

export default new CategoryController();