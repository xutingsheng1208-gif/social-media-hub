import { Request, Response } from 'express';
import prisma from '../services/database';

export class TagController {
  // 获取所有标签
  async getAllTags(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      // 搜索筛选
      if (search) {
        where.name = {
          contains: search as string
        };
      }

      const [tags, total] = await Promise.all([
        prisma.tag.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { contents: true }
            }
          }
        }),
        prisma.tag.count({ where })
      ]);

      res.json({
        data: tags,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting tags:', error);
      res.status(500).json({ error: { message: 'Failed to get tags' } });
    }
  }

  // 获取热门标签
  async getPopularTags(req: Request, res: Response) {
    try {
      const { limit = 20 } = req.query;

      // 获取标签及其使用次数
      const tagCounts = await prisma.tag.findMany({
        include: {
          _count: {
            select: { contents: true }
          }
        },
        orderBy: {
          contents: {
            _count: 'desc'
          }
        },
        take: Number(limit)
      });

      res.json(tagCounts);
    } catch (error) {
      console.error('Error getting popular tags:', error);
      res.status(500).json({ error: { message: 'Failed to get popular tags' } });
    }
  }

  // 获取单个标签
  async getTagById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tag = await prisma.tag.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: { contents: true }
          }
        }
      });

      if (!tag) {
        return res.status(404).json({ error: { message: 'Tag not found' } });
      }

      res.json(tag);
    } catch (error) {
      console.error('Error getting tag:', error);
      res.status(500).json({ error: { message: 'Failed to get tag' } });
    }
  }

  // 创建标签
  async createTag(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: { message: 'Tag name is required' } });
      }

      // 检查标签是否已存在
      const existingTag = await prisma.tag.findUnique({
        where: { name }
      });

      if (existingTag) {
        return res.status(400).json({ error: { message: 'Tag already exists' } });
      }

      const tag = await prisma.tag.create({
        data: { name }
      });

      res.status(201).json(tag);
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: { message: 'Failed to create tag' } });
    }
  }

  // 批量创建标签
  async batchCreateTags(req: Request, res: Response) {
    try {
      const { names } = req.body;

      if (!Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: { message: 'Tag names array is required' } });
      }

      // 过滤掉空值
      const validNames = names.filter(name => name && typeof name === 'string');

      if (validNames.length === 0) {
        return res.status(400).json({ error: { message: 'No valid tag names provided' } });
      }

      const tags = await Promise.all(
        validNames.map(async (name) => {
          try {
            return await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name }
            });
          } catch (error) {
            // 如果标签已存在，返回现有标签
            return prisma.tag.findUnique({ where: { name } });
          }
        })
      );

      res.status(201).json(tags);
    } catch (error) {
      console.error('Error batch creating tags:', error);
      res.status(500).json({ error: { message: 'Failed to create tags' } });
    }
  }

  // 更新标签
  async updateTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: { message: 'Tag name is required' } });
      }

      // 检查标签是否已存在（除了当前标签）
      const existingTag = await prisma.tag.findFirst({
        where: {
          name,
          id: { not: Number(id) }
        }
      });

      if (existingTag) {
        return res.status(400).json({ error: { message: 'Tag name already exists' } });
      }

      const tag = await prisma.tag.update({
        where: { id: Number(id) },
        data: { name }
      });

      res.json(tag);
    } catch (error) {
      console.error('Error updating tag:', error);
      res.status(500).json({ error: { message: 'Failed to update tag' } });
    }
  }

  // 删除标签
  async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 检查标签是否存在
      const tag = await prisma.tag.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: { contents: true }
          }
        }
      });

      if (!tag) {
        return res.status(404).json({ error: { message: 'Tag not found' } });
      }

      // 检查是否有关联的内容
      if (tag._count.contents > 0) {
        return res.status(400).json({
          error: {
            message: 'Cannot delete tag with associated contents. Please remove the tag from contents first.'
          }
        });
      }

      await prisma.tag.delete({
        where: { id: Number(id) }
      });

      res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ error: { message: 'Failed to delete tag' } });
    }
  }

  // 合并标签
  async mergeTags(req: Request, res: Response) {
    try {
      const { sourceTagId, targetTagId } = req.body;

      if (!sourceTagId || !targetTagId) {
        return res.status(400).json({ error: { message: 'Source and target tag IDs are required' } });
      }

      if (sourceTagId === targetTagId) {
        return res.status(400).json({ error: { message: 'Source and target tags cannot be the same' } });
      }

      // 检查标签是否存在
      const [sourceTag, targetTag] = await Promise.all([
        prisma.tag.findUnique({ where: { id: Number(sourceTagId) } }),
        prisma.tag.findUnique({ where: { id: Number(targetTagId) } })
      ]);

      if (!sourceTag || !targetTag) {
        return res.status(404).json({ error: { message: 'One or both tags not found' } });
      }

      // 获取所有使用源标签的内容
      const contentsWithSourceTag = await prisma.content.findMany({
        where: {
          tags: {
            has: sourceTag.name
          }
        }
      });

      // 更新这些内容，将源标签替换为目标标签
      for (const content of contentsWithSourceTag) {
        const updatedTags = content.tags
          .filter(tag => tag !== sourceTag.name)
          .concat(targetTag.name);

        await prisma.content.update({
          where: { id: content.id },
          data: { tags: updatedTags }
        });
      }

      // 删除源标签
      await prisma.tag.delete({
        where: { id: Number(sourceTagId) }
      });

      res.json({ message: 'Tags merged successfully' });
    } catch (error) {
      console.error('Error merging tags:', error);
      res.status(500).json({ error: { message: 'Failed to merge tags' } });
    }
  }
}

export default new TagController();