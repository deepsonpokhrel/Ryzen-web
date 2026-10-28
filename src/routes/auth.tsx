import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/SiteHeader';
import { staffEmailFor, DEMO_STAFF } from '@/lib/staff-auth';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Staff Portal | RYZENX Cinema' },
    { name: 'description', content: 'Staff sign in for RYZENX Cinema management.' },
    { property: 'og:title', content: 'Staff Portal | RYZENX Cinema' },
    { property: 'og:description', content: 'RYZENX Cinema staff access.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [username, setUsername] = useState<string>(DEMO_STAFF.username);
  const [password, setPassword] = useState<string>(DEMO_STAFF.password);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) nav({ to: '/admin', replace: true }); }); }, [nav]);

  async function submit() {
    setBusy(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: staffEmailFor(username), password });
    if (error) { setError(error.message.toLowerCase().includes('invalid') ? 'Incorrect username or password.' : 'Sign in failed. Please try again.'); setBusy(false); return; }
    await nav({ to: '/admin', replace: true });
  }

  return <><SiteHeader /><main className="mx-auto max-w-md px-4 py-16">
    <div className="rounded-xl border border-border bg-card p-8">
      <ShieldCheck className="h-8 w-8 text-gold" />
      <h1 className="mt-4 text-3xl">Staff portal</h1>
      <p className="mt-2 text-sm text-muted-foreground">Demo credentials: <strong>{DEMO_STAFF.username}</strong> / <strong>{DEMO_STAFF.password}</strong></p>
      <form className="mt-6 space-y-5" onSubmit={e => { e.preventDefault(); submit(); }}>
        <label className="block text-sm">Username<Input required maxLength={64} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-2" /></label>
        <label className="block text-sm">Password<Input required type="password" maxLength={128} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2" /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button disabled={busy} className="w-full bg-gold text-gold-foreground">{busy ? <><Loader2 className="animate-spin" />Signing in…</> : 'Sign In as Staff'}</Button>
        <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => { setUsername(DEMO_STAFF.username); setPassword(DEMO_STAFF.password); setError(''); }}>Fill Demo Credentials</Button>
      </form>
    </div>
  </main></>;
}
