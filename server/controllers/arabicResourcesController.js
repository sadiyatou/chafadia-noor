const { query } = require('../config/db');

/* GET /api/arabic-resources */
const getResources = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT r.*, u.full_name AS uploader_name
               FROM arabic_resources r
               LEFT JOIN users u ON u.id = r.uploaded_by
               WHERE r.is_published = true`;
    const params = [];

    if (type && ['pdf','image','video','audio'].includes(type)) {
      params.push(type);
      sql += ` AND r.type = $${params.length}`;
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [rows, countRow] = await Promise.all([
      query(sql, params),
      query(`SELECT COUNT(*) FROM arabic_resources WHERE is_published = true${type ? " AND type = $1" : ''}`, type ? [type] : []),
    ]);

    res.json({ success: true, resources: rows.rows, total: parseInt(countRow.rows[0].count) });
  } catch (err) { next(err); }
};

/* GET /api/arabic-resources/:id  (increment view count) */
const getResource = async (req, res, next) => {
  try {
    await query('UPDATE arabic_resources SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    const result = await query(
      `SELECT r.*, u.full_name AS uploader_name FROM arabic_resources r
       LEFT JOIN users u ON u.id = r.uploaded_by WHERE r.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.json({ success: true, resource: result.rows[0] });
  } catch (err) { next(err); }
};

/* POST /api/arabic-resources  (admin only) */
const createResource = async (req, res, next) => {
  try {
    const { title, description, type, url, file_name, file_size, duration } = req.body;
    if (!title || !type || !url) {
      return res.status(400).json({ success: false, message: 'title, type and url are required.' });
    }
    const result = await query(
      `INSERT INTO arabic_resources (title, description, type, url, file_name, file_size, duration, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [title, description || null, type, url, file_name || null, file_size || null, duration || null, req.user.id]
    );
    res.status(201).json({ success: true, resource: result.rows[0] });
  } catch (err) { next(err); }
};

/* PUT /api/arabic-resources/:id  (admin only) */
const updateResource = async (req, res, next) => {
  try {
    const { title, description, is_published } = req.body;
    const result = await query(
      `UPDATE arabic_resources SET title=COALESCE($1,title), description=COALESCE($2,description),
       is_published=COALESCE($3,is_published), updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [title, description, is_published, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, resource: result.rows[0] });
  } catch (err) { next(err); }
};

/* DELETE /api/arabic-resources/:id  (admin only) */
const deleteResource = async (req, res, next) => {
  try {
    await query('DELETE FROM arabic_resources WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* Admin: GET /api/arabic-resources/admin/all  (all, including unpublished) */
const adminGetAll = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let sql = `SELECT r.*, u.full_name AS uploader_name FROM arabic_resources r
               LEFT JOIN users u ON u.id = r.uploaded_by`;
    const params = [];
    if (type) { params.push(type); sql += ` WHERE r.type=$1`; }
    sql += ` ORDER BY r.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit, offset);
    const result = await query(sql, params);
    res.json({ success: true, resources: result.rows });
  } catch (err) { next(err); }
};

module.exports = { getResources, getResource, createResource, updateResource, deleteResource, adminGetAll };
