const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const jobSearchRoutes = require('./routes/jobSearchRoutes');

const app = express();

app.use(helmet());
const allowedOrigins = new Set(
  [env.clientUrl, ...String(env.clientUrl).split(',')]
    .map((o) => o.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      try {
        const { hostname, protocol, port } = new URL(origin);
        const isLocal =
          (hostname === 'localhost' || hostname === '127.0.0.1') &&
          protocol === 'http:' &&
          (env.nodeEnv === 'development' || allowedOrigins.has(origin));
        if (isLocal) return callback(null, true);
      } catch (_) {
        // fall through
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.nodeEnv } });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'AI Resume & Job Intelligence Platform API',
      status: 'ok',
      clientUrl: env.clientUrl,
      health: '/api/health',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/job-search', jobSearchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
