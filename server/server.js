require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const { pool } = require('./config/db');
const setupSocket = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chats');
const notificationRoutes = require('./routes/notifications');
const callRoutes = require('./routes/calls');
const streamRoutes = require('./routes/streams');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');
const arabicResourcesRoutes = require('./routes/arabicResources');
const coursesRoutes = require('./routes/courses');
const communityGroupsRoutes = require('./routes/communityGroups');
const aiRoutes = require('./routes/ai');
const articlesRoutes = require('./routes/articles');
const essentialsRoutes = require('./routes/essentials');
const downloadsRoutes = require('./routes/downloads');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static. Files under uploads/documents/ come from
// the unrestricted "any document" upload endpoint (see config/multer.js) —
// force those to download rather than render inline, and block MIME
// sniffing, so even a file that slips past the extension/MIME denylist
// can't execute as HTML/script in a browser that opens the link directly.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (path.dirname(filePath).endsWith(`${path.sep}documents`)) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  },
}));

// ── Routes ──
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/arabic-resources', arabicResourcesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/community-groups', communityGroupsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/essentials', essentialsRoutes);
app.use('/api/downloads', downloadsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// ── Socket.io ──
setupSocket(io);

// Make io accessible to controllers if needed
app.set('io', io);

// ── Error handler (must be last) ──
app.use(errorHandler);

// ── Start ──
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ✓ Chafadia Noor API running on http://0.0.0.0:${PORT}`);
  console.log(`  ✓ Health check:  http://localhost:${PORT}/api/health`);
  console.log(`  ✓ Socket.io:     ws://localhost:${PORT}`);
  console.log(`  ✓ Uploads at:    http://localhost:${PORT}/uploads/\n`);
});
