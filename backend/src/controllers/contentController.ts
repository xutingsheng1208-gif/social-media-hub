import { Request, Response } from 'express';
import prisma from '../services/database';
import { DouyinExtractor } from '../extractors/douyin';
import { XiaohongshuExtractor } from '../extractors/xiaohongshu';
import path from 'path';

const uploadDir = path.join(__dirname, '../../uploads');

export class ContentController {
  // 获取所有内容
  async getAllContents(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, category, tag, search, platform } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      // 分类筛选
      if (category) {
        where.categoryId = Number(category);
      }

      // 平台筛选
      if (platform) {
        where.sourcePlatform = platform;
      }

      // 搜索筛选
      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } }
        ];
      }

      // 标签筛选
      if (tag) {
        where.tags = {
          has: tag as string
        };
      }

      const [contents, total] = await Promise.all([
        prisma.content.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            category: true
          }
        }),
        prisma.content.count({ where })
      ]);

      res.json({
        data: contents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting contents:', error);
      res.status(500).json({ error: { message: 'Failed to get contents' } });
    }
  }

  // 获取单个内容
  async getContentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const content = await prisma.content.findUnique({
        where: { id: Number(id) },
        include: {
          category: true
        }
      });

      if (!content) {
        return res.status(404).json({ error: { message: 'Content not found' } });
      }

      res.json(content);
    } catch (error) {
      console.error('Error getting content:', error);
      res.status(500).json({ error: { message: 'Failed to get content' } });
    }
  }

  // 创建内容
  async createContent(req: Request, res: Response) {
    try {
      const { title, description, sourcePlatform, sourceUrl, contentType, filePath, thumbnailPath, tags, categoryId } = req.body;

      const content = await prisma.content.create({
        data: {
          title,
          description,
          sourcePlatform,
          sourceUrl,
          contentType,
          filePath,
          thumbnailPath,
          tags: tags || [],
          categoryId: categoryId ? Number(categoryId) : null
        },
        include: {
          category: true
        }
      });

      res.status(201).json(content);
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ error: { message: 'Failed to create content' } });
    }
  }

  // 更新内容
  async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, tags, categoryId } = req.body;

      const content = await prisma.content.update({
        where: { id: Number(id) },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(tags && { tags }),
          ...(categoryId !== undefined && { categoryId: categoryId ? Number(categoryId) : null })
        },
        include: {
          category: true
        }
      });

      res.json(content);
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: { message: 'Failed to update content' } });
    }
  }

  // 删除内容
  async deleteContent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 先获取内容信息，用于删除文件
      const content = await prisma.content.findUnique({
        where: { id: Number(id) }
      });

      if (!content) {
        return res.status(404).json({ error: { message: 'Content not found' } });
      }

      // 删除数据库记录
      await prisma.content.delete({
        where: { id: Number(id) }
      });

      // TODO: 删除相关文件
      // 这里需要谨慎实现，确保只删除属于该内容的文件

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: { message: 'Failed to delete content' } });
    }
  }

  // 批量删除内容
  async batchDeleteContents(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: { message: 'Invalid IDs' } });
      }

      await prisma.content.deleteMany({
        where: {
          id: {
            in: ids.map((id: any) => Number(id))
          }
        }
      });

      res.json({ message: 'Contents deleted successfully' });
    } catch (error) {
      console.error('Error batch deleting contents:', error);
      res.status(500).json({ error: { message: 'Failed to delete contents' } });
    }
  }

  // 搜索内容
  async searchContents(req: Request, res: Response) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      if (!q) {
        return res.status(400).json({ error: { message: 'Search query is required' } });
      }

      const searchTerm = q as string;

      const [contents, total] = await Promise.all([
        prisma.content.findMany({
          where: {
            OR: [
              { title: { contains: searchTerm } },
              { description: { contains: searchTerm } },
              { tags: { has: searchTerm } }
            ]
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            category: true
          }
        }),
        prisma.content.count({
          where: {
            OR: [
              { title: { contains: searchTerm } },
              { description: { contains: searchTerm } },
              { tags: { has: searchTerm } }
            ]
          }
        })
      ]);

      res.json({
        data: contents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error searching contents:', error);
      res.status(500).json({ error: { message: 'Failed to search contents' } });
    }
  }
}

export default new ContentController();