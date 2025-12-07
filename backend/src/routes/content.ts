import { Router } from 'express';
import contentController from '../controllers/contentController';

const router = Router();

// GET /api/content - 获取所有内容
router.get('/', contentController.getAllContents);

// GET /api/content/search - 搜索内容
router.get('/search', contentController.searchContents);

// GET /api/content/:id - 获取单个内容
router.get('/:id', contentController.getContentById);

// POST /api/content - 创建内容
router.post('/', contentController.createContent);

// PUT /api/content/:id - 更新内容
router.put('/:id', contentController.updateContent);

// DELETE /api/content/:id - 删除内容
router.delete('/:id', contentController.deleteContent);

// POST /api/content/batch-delete - 批量删除内容
router.post('/batch-delete', contentController.batchDeleteContents);

export default router;