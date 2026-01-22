
import { createClient } from '@supabase/supabase-js';

/**
 * Pulse Supabase Client Configuration
 * This module initializes the connection to the backend.
 * It uses the URL and Key provided in the .env file.
 */

const supabaseUrl = 'https://kllcaphbxfkdzekiruny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbGNhcGhieGZrZHpla2lydW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQ2NTcsImV4cCI6MjA4NDQ4MDY1N30.PKoUWBNgk7UT86DFW5TqKdMkvduFxX9t0w4XJD0uNqQ';

// Fallback logic to check for injected environment variables if available
const finalUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || supabaseUrl;
const finalKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey);

// Verify connection availability
if (!finalUrl || !finalKey) {
  console.error('PULSE_FATAL: Supabase configuration missing. Database functionality is disabled.');
}
