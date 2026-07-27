import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!anonKey) missing.push('VITE_SUPABASE_ANON_KEY');
    return res.status(500).json({ 
      error: `Server configuration missing: Please set ${missing.join(', ')} in Vercel Environment Variables.` 
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const supabaseCaller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: { user: caller }, error: callerError } = await supabaseCaller.auth.getUser();
  if (callerError || !caller) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (caller.id === userId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', caller.id)
    .maybeSingle();

  if (!adminProfile?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle();

  if (targetProfile?.is_admin) {
    return res.status(403).json({ error: 'Cannot delete admin accounts' });
  }

  await supabaseAdmin.from('enrollments').delete().eq('user_id', userId);
  await supabaseAdmin.from('profiles').delete().eq('id', userId);

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(200).json({ success: true });
}
