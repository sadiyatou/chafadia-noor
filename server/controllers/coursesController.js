const nodemailer = require('nodemailer');
const { query } = require('../config/db');

const sendCertificateEmail = async (userEmail, userName, courseTitle) => {
  if (!process.env.SMTP_HOST) {
    console.log(`[CERTIFICATE] Send certificate to ${userEmail} for course: "${courseTitle}"`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"Chafadia Noor" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Certificate of Completion — ${courseTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:2px solid #063B28;border-radius:12px;overflow:hidden">
        <div style="background:#063B28;padding:30px;text-align:center">
          <h1 style="color:#D4A017;margin:0;letter-spacing:2px">CHAFADIA NOOR</h1>
          <p style="color:#E8F5EF;margin:8px 0 0">Guided by Faith • Inspired by Love</p>
        </div>
        <div style="padding:36px;text-align:center">
          <h2 style="color:#063B28">Certificate of Completion</h2>
          <p style="color:#374151;font-size:16px">This is to certify that</p>
          <h2 style="color:#D4A017;font-size:28px;margin:8px 0">${userName}</h2>
          <p style="color:#374151;font-size:16px">has successfully completed the course</p>
          <h3 style="color:#063B28;font-size:22px;margin:8px 0">"${courseTitle}"</h3>
          <p style="color:#6b7280;margin-top:24px">May Allah bless your knowledge and increase you in it.</p>
          <div style="margin-top:32px;padding:16px;background:#F7F5EE;border-radius:8px">
            <p style="color:#063B28;font-weight:700;margin:0">Chafadia Noor Team</p>
          </div>
        </div>
      </div>`,
  });
};

/* GET /api/courses  — published courses */
const getCourses = async (req, res, next) => {
  try {
    const { level, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE c.is_published = true';
    if (level) { params.push(level); where += ` AND c.level=$${params.length}`; }

    const sql = `
      SELECT c.*, u.full_name AS author_name,
        (SELECT COUNT(*) FROM course_lessons WHERE course_id = c.id) AS lesson_count,
        (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id) AS enrollment_count
      FROM courses c LEFT JOIN users u ON u.id = c.created_by
      ${where} ORDER BY c.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({ success: true, courses: result.rows });
  } catch (err) { next(err); }
};

/* GET /api/courses/live */
const getLiveCourses = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.title, c.description, c.scheduled_at,
              u.full_name AS teacher
       FROM courses c LEFT JOIN users u ON u.id = c.created_by
       WHERE c.is_live = true AND c.is_published = true
       ORDER BY c.scheduled_at ASC LIMIT 50`
    );
    res.json({ success: true, courses: result.rows.map(r => ({
      id: r.id, title: r.title, description: r.description,
      scheduledAt: r.scheduled_at, teacher: r.teacher || 'Chafadia Noor',
    })) });
  } catch (err) { next(err); }
};

/* GET /api/courses/:id */
const getCourse = async (req, res, next) => {
  try {
    const [course, lessons] = await Promise.all([
      query(`SELECT c.*, u.full_name AS author_name FROM courses c
             LEFT JOIN users u ON u.id=c.created_by WHERE c.id=$1`, [req.params.id]),
      query('SELECT * FROM course_lessons WHERE course_id=$1 ORDER BY order_index', [req.params.id]),
    ]);
    if (!course.rows.length) return res.status(404).json({ success: false, message: 'Course not found.' });

    let enrollment = null;
    let lessonProgress = [];
    if (req.user) {
      const enr = await query('SELECT * FROM course_enrollments WHERE course_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
      if (enr.rows.length) {
        enrollment = enr.rows[0];
        const prog = await query('SELECT lesson_id FROM course_lesson_progress WHERE enrollment_id=$1', [enr.rows[0].id]);
        lessonProgress = prog.rows.map(r => r.lesson_id);
      }
    }

    res.json({ success: true, course: course.rows[0], lessons: lessons.rows, enrollment, lessonProgress });
  } catch (err) { next(err); }
};

/* POST /api/courses/:id/enroll */
const enrollCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await query('SELECT id FROM courses WHERE id=$1 AND is_published=true', [id]);
    if (!course.rows.length) return res.status(404).json({ success: false, message: 'Course not found.' });

    const existing = await query('SELECT id FROM course_enrollments WHERE course_id=$1 AND user_id=$2', [id, req.user.id]);
    if (existing.rows.length) return res.json({ success: true, message: 'Already enrolled.', enrolled: true });

    await query('INSERT INTO course_enrollments (course_id, user_id) VALUES ($1,$2)', [id, req.user.id]);
    await query('UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id=$1', [id]);
    res.json({ success: true, message: 'Enrolled successfully.' });
  } catch (err) { next(err); }
};

/* POST /api/courses/:id/lessons/:lessonId/complete */
const completeLesson = async (req, res, next) => {
  try {
    const { id, lessonId } = req.params;
    const enr = await query('SELECT * FROM course_enrollments WHERE course_id=$1 AND user_id=$2', [id, req.user.id]);
    if (!enr.rows.length) return res.status(403).json({ success: false, message: 'Not enrolled.' });

    const enrollment = enr.rows[0];

    // Mark lesson done (ignore if already done)
    await query(
      'INSERT INTO course_lesson_progress (enrollment_id, lesson_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [enrollment.id, lessonId]
    );

    // Recalculate progress
    const [done, total] = await Promise.all([
      query('SELECT COUNT(*) FROM course_lesson_progress WHERE enrollment_id=$1', [enrollment.id]),
      query('SELECT COUNT(*) FROM course_lessons WHERE course_id=$1', [id]),
    ]);

    const progress = total.rows[0].count > 0
      ? Math.round((done.rows[0].count / total.rows[0].count) * 100)
      : 0;

    const isComplete = progress === 100;
    const updateFields = { progress_percent: progress };
    if (isComplete && !enrollment.completed_at) updateFields.completed_at = new Date();

    await query(
      'UPDATE course_enrollments SET progress_percent=$1, completed_at=COALESCE(completed_at,$2) WHERE id=$3',
      [progress, isComplete ? new Date() : null, enrollment.id]
    );

    if (isComplete && !enrollment.completed_at) {
      // Notify admin via console; certificate sent by admin manually or auto
      const user = await query('SELECT full_name, email FROM users WHERE id=$1', [req.user.id]);
      const course = await query('SELECT title FROM courses WHERE id=$1', [id]);
      console.log(`[COURSE COMPLETE] ${user.rows[0].full_name} completed "${course.rows[0].title}"`);
    }

    res.json({ success: true, progress, isComplete });
  } catch (err) { next(err); }
};

/* Admin: POST /api/courses  — create */
const adminCreateCourse = async (req, res, next) => {
  try {
    const { title, description, cover_image, level, language, duration_minutes } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
    const result = await query(
      `INSERT INTO courses (title, description, cover_image, level, language, duration_minutes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description||null, cover_image||null, level||'beginner', language||'en', duration_minutes||0, req.user.id]
    );
    res.status(201).json({ success: true, course: result.rows[0] });
  } catch (err) { next(err); }
};

/* Admin: PUT /api/courses/:id */
const adminUpdateCourse = async (req, res, next) => {
  try {
    const { title, description, cover_image, level, language, duration_minutes, is_published } = req.body;
    const result = await query(
      `UPDATE courses SET
         title=COALESCE($1,title), description=COALESCE($2,description),
         cover_image=COALESCE($3,cover_image), level=COALESCE($4,level),
         language=COALESCE($5,language), duration_minutes=COALESCE($6,duration_minutes),
         is_published=COALESCE($7,is_published), updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, description, cover_image, level, language, duration_minutes, is_published, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, course: result.rows[0] });
  } catch (err) { next(err); }
};

/* Admin: POST /api/courses/:id/lessons */
const adminAddLesson = async (req, res, next) => {
  try {
    const { title, content, type, media_url, file_name, order_index, duration_minutes } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
    const result = await query(
      `INSERT INTO course_lessons (course_id, title, content, type, media_url, file_name, order_index, duration_minutes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.id, title, content||null, type||'text', media_url||null, file_name||null, order_index||0, duration_minutes||0]
    );
    res.status(201).json({ success: true, lesson: result.rows[0] });
  } catch (err) { next(err); }
};

/* Admin: DELETE /api/courses/:id */
const adminDeleteCourse = async (req, res, next) => {
  try {
    await query('DELETE FROM courses WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* Admin: GET /api/courses/:id/enrollments */
const adminGetEnrollments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, u.full_name, u.email, u.phone FROM course_enrollments e
       JOIN users u ON u.id=e.user_id WHERE e.course_id=$1 ORDER BY e.enrolled_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, enrollments: result.rows });
  } catch (err) { next(err); }
};

/* Admin: POST /api/courses/:id/enrollments/:userId/certificate */
const adminSendCertificate = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const [enr, user, course] = await Promise.all([
      query('SELECT * FROM course_enrollments WHERE course_id=$1 AND user_id=$2', [id, userId]),
      query('SELECT full_name, email FROM users WHERE id=$1', [userId]),
      query('SELECT title FROM courses WHERE id=$1', [id]),
    ]);
    if (!enr.rows.length) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    if (!user.rows[0].email) return res.status(400).json({ success: false, message: 'User has no email.' });

    await sendCertificateEmail(user.rows[0].email, user.rows[0].full_name, course.rows[0].title);
    await query('UPDATE course_enrollments SET certificate_sent=true WHERE course_id=$1 AND user_id=$2', [id, userId]);

    res.json({ success: true, message: 'Certificate sent.' });
  } catch (err) { next(err); }
};

/* Admin: GET /api/courses (all, including unpublished) */
const adminGetCourses = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, u.full_name AS author_name,
         (SELECT COUNT(*) FROM course_lessons WHERE course_id=c.id) AS lesson_count,
         (SELECT COUNT(*) FROM course_enrollments WHERE course_id=c.id) AS enrollment_count,
         (SELECT COUNT(*) FROM course_enrollments WHERE course_id=c.id AND completed_at IS NOT NULL) AS completed_count
       FROM courses c LEFT JOIN users u ON u.id=c.created_by ORDER BY c.created_at DESC`
    );
    res.json({ success: true, courses: result.rows });
  } catch (err) { next(err); }
};

module.exports = {
  getCourses, getCourse, getLiveCourses, enrollCourse, completeLesson,
  adminCreateCourse, adminUpdateCourse, adminAddLesson, adminDeleteCourse,
  adminGetEnrollments, adminSendCertificate, adminGetCourses,
};
