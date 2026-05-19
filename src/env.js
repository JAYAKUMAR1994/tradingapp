import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  supabaseUrl: "https://ymbfkeainvrinajmzjsj.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYmZrZWFpbnZyaW5ham16anNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjY5ODIsImV4cCI6MjA5NDEwMjk4Mn0.gRGtyd2COdGgne8OSNvSS1u2qPQqz_Na4s1elN3m84Y",
  jwtSecret: process.env.JWT_SECRET || 'dev-secret'
};
