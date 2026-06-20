import { Router } from 'express';
import { getAboutInfo } from '../controllers/about.controller.js';

const router = Router();

router.get('/', getAboutInfo);

export default router;
