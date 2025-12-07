import { Request, Response } from 'express';
import { DouyinExtractor } from '../extractors/douyin';
import { XiaohongshuExtractor } from '../extractors/xiaohongshu';
import prisma from '../services/database';
import path from 'path';
import fs from 'fs/promises';

const uploadDir = path.join(__dirname, '../../uploads');

// 确保上传目录存在
const ensureUploadDirs = async () => {
  await fs.mkdir(path.join(uploadDir, 'videos'), { recursive: true });
  await fs.mkdir(path.join(uploadDir, 'images'), { recursive: true });
  await fs.mkdir(path.join(uploadDir, 'thumbnails'), { recursive: true });
};

export class ExtractController {
  // 提取内容
  async extractContent(req: Request, res: Response) {
    try {
      await ensureUploadDirs();

      const { url, platform, categoryId, tags } = req.body;

      if (!url || !platform) {
        return res.status(400).json({ error: { message: 'URL and platform are required' } });
      }

      let content;
      let contentType: string;
      let filePath: string | undefined;
      let thumbnailPath: string | undefined;

      // 根据平台选择提取器
      if (platform === 'douyin') {
        const extractor = new DouyinExtractor(uploadDir);
        await extractor.init();

        try {
          const douyinContent = await extractor.extractFromUrl(url);
          if (!douyinContent) {
            return res.status(400).json({ error: { message: 'Failed to extract content from Douyin' } });
          }

          content = {
            title: douyinContent.title || 'Untitled',
            description: douyinContent.description || '',
            tags: douyinContent.tags,
            videoUrl: douyinContent.videoUrl
          };

          contentType = 'video';
          filePath = douyinContent.videoUrl;

          await extractor.close();
        } catch (error) {
          await extractor.close();
          throw error;
        }
      } else if (platform === 'xiaohongshu') {
        const extractor = new XiaohongshuExtractor(uploadDir);
        await extractor.init();

        try {
          const xhsContent = await extractor.extractFromUrl(url);
          if (!xhsContent) {
            return res.status(400).json({ error: { message: 'Failed to extract content from Xiaohongshu' } });
          }

          content = {
            title: xhsContent.title || 'Untitled',
            description: xhsContent.description || '',
            tags: xhsContent.tags,
            images: xhsContent.images,
            videoUrl: xhsContent.videoUrl
          };

          contentType = xhsContent.videoUrl ? 'video' : 'image';
          filePath = xhsContent.videoUrl || xhsContent.images?.[0];

          // 如果是图片，使用第一张图片作为主图
          if (xhsContent.images && xhsContent.images.length > 0) {
            filePath = xhsContent.images[0];
          }

          await extractor.close();
        } catch (error) {
          await extractor.close();
          throw error;
        }
      } else {
        return res.status(400).json({ error: { message: 'Unsupported platform' } });
      }

      // 保存到数据库
      const savedContent = await prisma.content.create({
        data: {
          title: content.title,
          description: content.description,
          sourcePlatform: platform,
          sourceUrl: url,
          contentType,
          filePath,
          thumbnailPath,
          tags: [...content.tags, ...(tags || [])],
          categoryId: categoryId ? Number(categoryId) : null
        },
        include: {
          category: true
        }
      });

      res.status(201).json(savedContent);
    } catch (error) {
      console.error('Error extracting content:', error);
      res.status(500).json({ error: { message: 'Failed to extract content' } });
    }
  }

  // 预览内容（不保存）
  async previewContent(req: Request, res: Response) {
    try {
      const { url, platform } = req.body;

      if (!url || !platform) {
        return res.status(400).json({ error: { message: 'URL and platform are required' } });
      }

      let preview;

      if (platform === 'douyin') {
        const extractor = new DouyinExtractor(uploadDir);
        await extractor.init();

        try {
          const douyinContent = await extractor.extractFromUrl(url);
          preview = douyinContent;
          await extractor.close();
        } catch (error) {
          await extractor.close();
          throw error;
        }
      } else if (platform === 'xiaohongshu') {
        const extractor = new XiaohongshuExtractor(uploadDir);
        await extractor.init();

        try {
          const xhsContent = await extractor.extractFromUrl(url);
          preview = xhsContent;
          await extractor.close();
        } catch (error) {
          await extractor.close();
          throw error;
        }
      } else {
        return res.status(400).json({ error: { message: 'Unsupported platform' } });
      }

      if (!preview) {
        return res.status(400).json({ error: { message: 'Failed to extract content' } });
      }

      res.json(preview);
    } catch (error) {
      console.error('Error previewing content:', error);
      res.status(500).json({ error: { message: 'Failed to preview content' } });
    }
  }

  // 检测URL类型
  async detectUrlType(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: { message: 'URL is required' } });
      }

      let platform = '';

      if (url.includes('douyin.com') || url.includes('iesdouyin.com')) {
        platform = 'douyin';
      } else if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) {
        platform = 'xiaohongshu';
      } else {
        return res.status(400).json({ error: { message: 'Unsupported URL' } });
      }

      res.json({ platform, url });
    } catch (error) {
      console.error('Error detecting URL type:', error);
      res.status(500).json({ error: { message: 'Failed to detect URL type' } });
    }
  }
}

export default new ExtractController();