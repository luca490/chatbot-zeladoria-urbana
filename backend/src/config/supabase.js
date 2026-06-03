const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock-key';

// Instância do Supabase configurada
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
