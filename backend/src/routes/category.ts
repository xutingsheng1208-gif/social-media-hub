import { Router } from 'express';
import categoryController from '../controllers/categoryController';

const router = Router();

// GET /api/categories - 获取所有分类
router.get('/', categoryController.getAllCategories);

// GET /api/categories/stats - 获取分类统计
router.get('/stats', categoryController.getCategoryStats);

// GET /api/categories/:id - 获取单个分类
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - 创建分类
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - 更新分类
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - 删除分类
router.delete('/:id', categoryController.deleteCategory);

export default router;