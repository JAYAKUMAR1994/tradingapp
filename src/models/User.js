import bcrypt from 'bcryptjs';
import { supabase } from '../supabase.js';

export class User {
  static async findOne(filter) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .match(filter)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  }

  static async create({ name, email, password }) {
    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password_hash }])
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }
}
