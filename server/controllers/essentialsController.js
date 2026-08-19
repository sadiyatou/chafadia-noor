const { query } = require('../config/db');

/* GET /api/essentials */
const getEssentials = async (req, res, next) => {
  try {
    const { category } = req.query;
    let sql = `SELECT e.* FROM essentials e WHERE e.is_published = true`;
    const params = [];
    if (category) {
      params.push(category);
      sql += ` AND e.category = $${params.length}`;
    }
    sql += ` ORDER BY e.order_index ASC, e.created_at ASC`;
    const result = await query(sql, params);
    res.json({ success: true, essentials: result.rows });
  } catch (err) { next(err); }
};

/* GET /api/essentials/:id */
const getEssential = async (req, res, next) => {
  try {
    await query('UPDATE essentials SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    const result = await query('SELECT * FROM essentials WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, essential: result.rows[0] });
  } catch (err) { next(err); }
};

/* POST /api/essentials  (admin only) */
const createEssential = async (req, res, next) => {
  try {
    const { title, category, description, content, media_url, media_type, order_index } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required.' });
    const result = await query(
      `INSERT INTO essentials (title, category, description, content, media_url, media_type, order_index, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, category || 'general', description || null, content || null, media_url || null, media_type || 'text', order_index || 0, req.user.id]
    );
    res.status(201).json({ success: true, essential: result.rows[0] });
  } catch (err) { next(err); }
};

/* PUT /api/essentials/:id  (admin only) */
const updateEssential = async (req, res, next) => {
  try {
    const { title, category, description, content, media_url, media_type, order_index, is_published } = req.body;
    const result = await query(
      `UPDATE essentials SET
         title=COALESCE($1,title), category=COALESCE($2,category), description=COALESCE($3,description),
         content=COALESCE($4,content), media_url=COALESCE($5,media_url), media_type=COALESCE($6,media_type),
         order_index=COALESCE($7,order_index), is_published=COALESCE($8,is_published), updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [title, category, description, content, media_url, media_type, order_index, is_published, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, essential: result.rows[0] });
  } catch (err) { next(err); }
};

/* DELETE /api/essentials/:id  (admin only) */
const deleteEssential = async (req, res, next) => {
  try {
    await query('DELETE FROM essentials WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* Admin: GET /api/essentials/admin/all */
const adminGetAll = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM essentials ORDER BY category, order_index ASC, created_at ASC');
    res.json({ success: true, essentials: result.rows });
  } catch (err) { next(err); }
};

module.exports = { getEssentials, getEssential, createEssential, updateEssential, deleteEssential, adminGetAll };
