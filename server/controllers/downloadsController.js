const { query } = require('../config/db');

/* GET /api/downloads */
const getDownloads = async (req, res, next) => {
  try {
    const { category, file_type, page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT d.* FROM downloads d WHERE d.is_published = true`;
    const params = [];
    if (category) { params.push(category); sql += ` AND d.category = $${params.length}`; }
    if (file_type) { params.push(file_type); sql += ` AND d.file_type = $${params.length}`; }
    sql += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({ success: true, downloads: result.rows });
  } catch (err) { next(err); }
};

/* GET /api/downloads/:id  (increment download count — call when a device starts downloading) */
const getDownload = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE downloads SET download_count = download_count + 1 WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, download: result.rows[0] });
  } catch (err) { next(err); }
};

/* POST /api/downloads  (admin only — file already uploaded via /api/upload/*) */
const createDownload = async (req, res, next) => {
  try {
    const { title, description, category, file_type, file_url, file_name, file_size, thumbnail_url } = req.body;
    if (!title || !file_type || !file_url) {
      return res.status(400).json({ success: false, message: 'title, file_type and file_url are required.' });
    }
    const result = await query(
      `INSERT INTO downloads (title, description, category, file_type, file_url, file_name, file_size, thumbnail_url, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description || null, category || 'general', file_type, file_url, file_name || null, file_size || null, thumbnail_url || null, req.user.id]
    );
    res.status(201).json({ success: true, download: result.rows[0] });
  } catch (err) { next(err); }
};

/* PUT /api/downloads/:id  (admin only) */
const updateDownload = async (req, res, next) => {
  try {
    const { title, description, category, thumbnail_url, is_published } = req.body;
    const result = await query(
      `UPDATE downloads SET
         title=COALESCE($1,title), description=COALESCE($2,description), category=COALESCE($3,category),
         thumbnail_url=COALESCE($4,thumbnail_url), is_published=COALESCE($5,is_published), updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title, description, category, thumbnail_url, is_published, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, download: result.rows[0] });
  } catch (err) { next(err); }
};

/* DELETE /api/downloads/:id  (admin only) */
const deleteDownload = async (req, res, next) => {
  try {
    await query('DELETE FROM downloads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* Admin: GET /api/downloads/admin/all */
const adminGetAll = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM downloads ORDER BY created_at DESC');
    res.json({ success: true, downloads: result.rows });
  } catch (err) { next(err); }
};

module.exports = { getDownloads, getDownload, createDownload, updateDownload, deleteDownload, adminGetAll };
