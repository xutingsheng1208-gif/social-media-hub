import { Router } from 'express';
import extractController from '../controllers/extractController';

const router = Router();

// POST /api/extract/detect - 检测URL类型
router.post('/detect', extractController.detectUrlType);

// POST /api/extract/preview - 预览内容
router.post('/preview', extractController.previewContent);

// POST /api/extract - 提取并保存内容
router.post('/', extractController.extractContent);

export default router;