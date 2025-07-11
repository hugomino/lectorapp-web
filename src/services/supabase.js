// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL   = 'https://pawdwtqtzxbpshlplcwv.supabase.co';
const SUPABASE_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhd2R3dHF0enhicHNobHBsY3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTU5MDEsImV4cCI6MjA2MDM5MTkwMX0.YxnqfGGz5Hx3WgjuK2WThPh5Hku65owCqhejQi2gPMw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
