import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface XiaohongshuContent {
  title: string;
  description: string;
  author: string;
  images: string[];
  videoUrl?: string;
  tags: string[];
  createdAt: Date;
}

export class XiaohongshuExtractor {
  private browser: Browser | null = null;
  private uploadDir: string;

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir;
  }

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }

  async extractFromUrl(url: string): Promise<XiaohongshuContent | null> {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser!.newPage();

    try {
      // 设置用户代理
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // 设置视口
      await page.setViewport({ width: 1366, height: 768 });

      // 访问页面
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // 等待内容加载
      await page.waitForSelector('.note-content', { timeout: 10000 });

      // 提取内容
      const content = await page.evaluate(() => {
        // 标题和描述
        const titleEl = document.querySelector('.note-content .title') ||
                        document.querySelector('[data-testid="note-title"]');
        const title = titleEl?.textContent?.trim() || '';

        const descEl = document.querySelector('.note-content .desc') ||
                      document.querySelector('[data-testid="note-text"]');
        const description = descEl?.textContent?.trim() || '';

        // 作者
        const authorEl = document.querySelector('.user-info .username') ||
                        document.querySelector('[data-testid="user-nickname"]');
        const author = authorEl?.textContent?.trim() || '';

        // 提取图片
        const imgElements = document.querySelectorAll('.note-content img, .swiper-slide img');
        const images = Array.from(imgElements)
          .map(img => img.src || img.getAttribute('data-src'))
          .filter(Boolean);

        // 提取视频
        const videoEl = document.querySelector('.note-content video');
        const videoUrl = videoEl?.src || videoEl?.querySelector('source')?.src || null;

        // 提取标签
        const tagElements = document.querySelectorAll('.note-tag, .hashtag');
        const tags = Array.from(tagElements)
          .map(el => el.textContent?.replace('#', '').trim())
          .filter(Boolean);

        return {
          title,
          description,
          author,
          images,
          videoUrl,
          tags
        };
      });

      // 下载图片
      const downloadedImages: string[] = [];
      if (content.images && content.images.length > 0) {
        for (const imgUrl of content.images) {
          try {
            const imagePath = await this.downloadImage(imgUrl);
            downloadedImages.push(imagePath);
          } catch (error) {
            console.error('Failed to download image:', imgUrl, error);
          }
        }
      }

      // 下载视频
      let downloadedVideo: string | undefined;
      if (content.videoUrl) {
        try {
          downloadedVideo = await this.downloadVideo(content.videoUrl);
        } catch (error) {
          console.error('Failed to download video:', content.videoUrl, error);
        }
      }

      return {
        title: content.title,
        description: content.description,
        author: content.author,
        images: downloadedImages,
        videoUrl: downloadedVideo,
        tags: content.tags,
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Error extracting Xiaohongshu content:', error);
      return null;
    } finally {
      await page.close();
    }
  }

  private async downloadImage(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.xiaohongshu.com/'
        }
      });

      const buffer = Buffer.from(response.data);
      const fileName = `xhs_image_${uuidv4()}.jpg`;
      const filePath = path.join(this.uploadDir, 'images', fileName);

      // 确保目录存在
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // 保存文件
      await fs.writeFile(filePath, buffer);

      return `/uploads/images/${fileName}`;
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  private async downloadVideo(videoUrl: string): Promise<string> {
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.xiaohongshu.com/'
        }
      });

      const buffer = Buffer.from(response.data);
      const fileName = `xhs_video_${uuidv4()}.mp4`;
      const filePath = path.join(this.uploadDir, 'videos', fileName);

      // 确保目录存在
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // 保存文件
      await fs.writeFile(filePath, buffer);

      return `/uploads/videos/${fileName}`;
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}