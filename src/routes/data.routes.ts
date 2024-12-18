import { Router } from 'express';
import { getData, postData, getLatestData } from '../controllers/data.controller';

const router = Router();

router.get('/', getData);
router.post('/create', postData);
router.get('/latest', getLatestData);

export default router;
