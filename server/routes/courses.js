const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getCourses, getCourse, getLiveCourses, enrollCourse, completeLesson,
  adminCreateCourse, adminUpdateCourse, adminAddLesson, adminDeleteCourse,
  adminGetEnrollments, adminSendCertificate, adminGetCourses,
} = require('../controllers/coursesController');

// Public (authenticated)
router.get('/',                                        authenticate, getCourses);
router.get('/live',                                    authenticate, getLiveCourses);
router.get('/admin/all',                               authenticate, requireAdmin, adminGetCourses);
router.get('/:id',                                     authenticate, getCourse);
router.post('/:id/enroll',                             authenticate, enrollCourse);
router.post('/:id/lessons/:lessonId/complete',         authenticate, completeLesson);

// Admin only
router.post('/',                                       authenticate, requireAdmin, adminCreateCourse);
router.put('/:id',                                     authenticate, requireAdmin, adminUpdateCourse);
router.post('/:id/lessons',                            authenticate, requireAdmin, adminAddLesson);
router.delete('/:id',                                  authenticate, requireAdmin, adminDeleteCourse);
router.get('/:id/enrollments',                         authenticate, requireAdmin, adminGetEnrollments);
router.post('/:id/enrollments/:userId/certificate',    authenticate, requireAdmin, adminSendCertificate);

module.exports = router;
