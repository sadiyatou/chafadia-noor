const { query } = require('../config/db');

/* GET /api/articles */
const getArticles = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT a.id, a.title, a.category, a.excerpt, a.cover_image, a.author,
                      a.read_minutes, a.view_count, a.created_at, u.full_name AS author_name
               FROM articles a
               LEFT JOIN users u ON u.id = a.created_by
               WHERE a.is_published = true`;
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND a.category = $${params.length}`;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [rows, countRow] = await Promise.all([
      query(sql, params),
      query(`SELECT COUNT(*) FROM articles WHERE is_published = true${category ? ' AND category = $1' : ''}`, category ? [category] : []),
    ]);

    res.json({ success: true, articles: rows.rows, total: parseInt(countRow.rows[0].count) });
  } catch (err) { next(err); }
};

/* GET /api/articles/:id */
const getArticle = async (req, res, next) => {
  try {
    await query('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    const result = await query(
      `SELECT a.*, u.full_name AS author_name FROM articles a
       LEFT JOIN users u ON u.id = a.created_by WHERE a.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, article: result.rows[0] });
  } catch (err) { next(err); }
};

/* POST /api/articles  (admin only) */
const createArticle = async (req, res, next) => {
  try {
    const { title, category, excerpt, content, cover_image, author, read_minutes } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'title and content are required.' });
    }
    const result = await query(
      `INSERT INTO articles (title, category, excerpt, content, cover_image, author, read_minutes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, category || 'general', excerpt || null, content, cover_image || null, author || null, read_minutes || 5, req.user.id]
    );
    res.status(201).json({ success: true, article: result.rows[0] });
  } catch (err) { next(err); }
};

/* PUT /api/articles/:id  (admin only) */
const updateArticle = async (req, res, next) => {
  try {
    const { title, category, excerpt, content, cover_image, author, read_minutes, is_published } = req.body;
    const result = await query(
      `UPDATE articles SET
         title=COALESCE($1,title), category=COALESCE($2,category), excerpt=COALESCE($3,excerpt),
         content=COALESCE($4,content), cover_image=COALESCE($5,cover_image), author=COALESCE($6,author),
         read_minutes=COALESCE($7,read_minutes), is_published=COALESCE($8,is_published), updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [title, category, excerpt, content, cover_image, author, read_minutes, is_published, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, article: result.rows[0] });
  } catch (err) { next(err); }
};

/* DELETE /api/articles/:id  (admin only) */
const deleteArticle = async (req, res, next) => {
  try {
    await query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* Admin: GET /api/articles/admin/all  (all, including unpublished) */
const adminGetAll = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let sql = `SELECT a.*, u.full_name AS author_name FROM articles a
               LEFT JOIN users u ON u.id = a.created_by`;
    const params = [];
    if (category) { params.push(category); sql += ` WHERE a.category=$1`; }
    sql += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await query(sql, params);
    res.json({ success: true, articles: result.rows });
  } catch (err) { next(err); }
};

module.exports = { getArticles, getArticle, createArticle, updateArticle, deleteArticle, adminGetAll };
