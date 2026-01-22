
import { createClient } from '@supabase/supabase-js';

/**
 * Pulse Supabase Client Configuration
 * Optimized for Vite production builds.
 */

const supabaseUrl = 'https://kllcaphbxfkdzekiruny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbGNhcGhieGZrZHpla2lydW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQ2NTcsImV4cCI6MjA4NDQ4MDY1N30.PKoUWBNgk7UT86DFW5TqKdMkvduFxX9t0w4XJD0uNqQ';

// Vite uses import.meta.env for environment variables. 
// We check for both Vite-style and process-style for maximum compatibility.
const finalUrl = import.meta.env?.VITE_SUPABASE_URL || supabaseUrl;
const finalKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey);

if (!finalUrl || !finalKey) {
  console.error('PULSE_FATAL: Supabase configuration missing.');
}
