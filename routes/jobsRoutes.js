import express from 'express';
const router = express.Router();

import {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  showStats,
  getJobById,
} from '../controllers/jobsController.js'

router.route('/').post(createJob).get(getAllJobs);
router.route('/stats').get(showStats);
router.route('/:id').delete(deleteJob).patch(updateJob).get(getJobById);

export default router