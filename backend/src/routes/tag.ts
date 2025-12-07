import { Router } from 'express';
import tagController from '../controllers/tagController';

const router = Router();

// GET /api/tags - 获取所有标签
router.get('/', tagController.getAllTags);

// GET /api/tags/popular - 获取热门标签
router.get('/popular', tagController.getPopularTags);

// GET /api/tags/:id - 获取单个标签
router.get('/:id', tagController.getTagById);

// POST /api/tags - 创建标签
router.post('/', tagController.createTag);

// POST /api/tags/batch - 批量创建标签
router.post('/batch', tagController.batchCreateTags);

// PUT /api/tags/:id - 更新标签
router.put('/:id', tagController.updateTag);

// DELETE /api/tags/:id - 删除标签
router.delete('/:id', tagController.deleteTag);

// POST /api/tags/merge - 合并标签
router.post('/merge', tagController.mergeTags);

export default router;