import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import '@lovable.dev/cloud-auth-js/styles.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/SiteHeader';

export const Route=createFileRoute('/auth')({head:()=>({meta:[{title:'Staff Sign In | RYZENX Cinema'},{name:'description',content:'Secure sign in for RYZENX Cinema staff.'},{property:'og:title',content:'Staff Sign In | RYZENX Cinema'},{property:'og:description',content:'RYZENX Cinema staff access.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Auth});
function Auth(){
  const nav=useNavigate();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [signup,setSignup]=useState(false);
  useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(data.user) nav({to:'/admin',replace:true});});},[nav]);
  async function submit(){setBusy(true);try{
    if(signup){const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/auth'}});if(error)throw error;toast.success('Check your email to confirm your account.');}
    else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await nav({to:'/admin',replace:true});}
  }catch(e){toast.error(e instanceof Error?e.message:'Sign in failed.');}finally{setBusy(false);}}
  async function social(provider:'google'|'lovable'){setBusy(true);try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin+'/auth'});if(result.error)throw result.error;if(!result.redirected)await nav({to:'/admin',replace:true});}catch{toast.error('Sign in failed. Try again.');}finally{setBusy(false);}}
  return <><SiteHeader/><main className="mx-auto max-w-md px-4 py-16"><h1 className="text-4xl">{signup?'Create account':'Staff sign in'}</h1><form className="mt-8 space-y-5" onSubmit={e=>{e.preventDefault();submit();}}><label className="block text-sm">Email<Input required type="email" maxLength={255} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2"/></label><label className="block text-sm">Password<Input required type="password" minLength={8} maxLength={128} autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2"/></label><Button disabled={busy} className="w-full bg-gold text-gold-foreground">{busy?'Please wait…':signup?'Create account':'Sign in'}</Button></form><div className="mt-5 space-y-3"><Button disabled={busy} variant="outline" className="w-full" onClick={()=>social('google')}>Continue with Google</Button><Button disabled={busy} className="lovable-auth-button w-full" onClick={()=>social('lovable')}>Continue with Lovable</Button><Button variant="ghost" className="w-full" onClick={()=>setSignup(!signup)}>{signup?'Already have an account? Sign in':'Create an account'}</Button><Button variant="link" disabled={busy||!email} onClick={async()=>{const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/reset-password'});error?toast.error(error.message):toast.success('Check your email for a password reset link.');}}>Forgot password?</Button></div></main></>;
}