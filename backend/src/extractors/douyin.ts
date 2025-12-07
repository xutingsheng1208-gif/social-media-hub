import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface DouyinContent {
  title: string;
  description: string;
  author: string;
  videoUrl?: string;
  images?: string[];
  tags: string[];
  createdAt: Date;
}

export class DouyinExtractor {
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

  async extractFromUrl(url: string): Promise<DouyinContent | null> {
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
      await page.waitForSelector('[data-e2e="browse-video-desc"]', { timeout: 10000 });

      // 提取内容
      const content = await page.evaluate(() => {
        const titleEl = document.querySelector('[data-e2e="browse-video-desc"]');
        const title = titleEl?.textContent?.trim() || '';

        const authorEl = document.querySelector('[data-e2e="browse-author-nickname"]');
        const author = authorEl?.textContent?.trim() || '';

        const descEl = document.querySelector('[data-e2e="browse-video-desc"]');
        const description = descEl?.textContent?.trim() || '';

        // 提取标签
        const tagElements = document.querySelectorAll('[data-e2e="browse-video-desc"] a');
        const tags = Array.from(tagElements)
          .map(el => el.textContent?.replace('#', '').trim())
          .filter(Boolean);

        return {
          title,
          description,
          author,
          tags
        };
      });

      // 提取视频URL
      const videoUrl = await this.extractVideoUrl(page);

      if (videoUrl) {
        // 下载视频
        const videoPath = await this.downloadVideo(videoUrl);
        return {
          ...content,
          videoUrl: videoPath,
          images: [],
          tags: content.tags,
          createdAt: new Date()
        };
      }

      return {
        ...content,
        tags: content.tags,
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Error extracting Douyin content:', error);
      return null;
    } finally {
      await page.close();
    }
  }

  private async extractVideoUrl(page: Page): Promise<string | null> {
    try {
      // 尝试从网络请求中获取视频URL
      const videoUrl = await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        if (videos.length > 0) {
          const video = videos[0];
          return video.src || video.querySelector('source')?.src || null;
        }
        return null;
      });

      return videoUrl;
    } catch (error) {
      console.error('Error extracting video URL:', error);
      return null;
    }
  }

  private async downloadVideo(videoUrl: string): Promise<string> {
    try {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const fileName = `douyin_${uuidv4()}.mp4`;
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