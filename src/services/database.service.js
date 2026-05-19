import { env } from '../env.js';
import { logger } from '../logger.js';
import { supabase } from '../supabase.js';
import { User } from '../models/User.js';

const ensureDefaultAdmin = async () => {
  const email = 'admin@tradesignal.local';
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    logger.info(`Default admin already exists: ${email}`);
    return;
  }

  await User.create({
    name: 'Admin',
    email,
    password: 'Admin@12345'
  });

  logger.info(`Default admin created: ${email}`);
};

export const connectDatabase = async () => {
  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const { error } = await supabase.from('users').select('id').limit(1).maybeSingle();
  if (error) throw error;

  logger.info('Supabase PostgreSQL connected');
  await ensureDefaultAdmin();
};
