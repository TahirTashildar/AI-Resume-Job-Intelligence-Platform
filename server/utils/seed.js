/**
 * Optional local seed script — creates one demo user so you can log in immediately.
 * Run with: npm run seed  (from the server/ directory)
 * Does NOT seed resumes/jobs/AI analyses, since those require real file uploads
 * and real LLM calls against your configured provider.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const logger = require('./logger');

const DEMO_EMAIL = 'demo@resumeiq.local';
const DEMO_PASSWORD = 'DemoPass123!';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    logger.info('Demo user already exists', { email: DEMO_EMAIL });
    process.exit(0);
  }

  await User.create({
    name: 'Demo User',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    profile: {
      skills: ['JavaScript', 'React', 'Node.js'],
      targetRoles: ['Full-Stack Developer'],
      preferredLocations: ['Remote'],
      experienceLevel: 'entry-level',
    },
  });

  logger.info('Demo user created', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seed failed', { message: err.message });
  process.exit(1);
});
