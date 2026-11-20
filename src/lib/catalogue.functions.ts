import { createServerFn, createMiddleware } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { movieSchema, screeningSchema, nepalDate } from './management';
import type { Movie, Show } from './data';

export const requireAdmin = createMiddleware({type:'function'}).middleware([requireSupabaseAuth]).server(async ({next,context}) => {
  const {data,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(error || !data) throw new Error('Administrator access required.');
  return next();
});

export const getCatalogue = createServerFn({method:'GET'}).handler(async () => {
  const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
  if(!url || !key) throw new Error('The cinema catalogue is temporarily unavailable.');
  const db=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const [ms,ss,screens]=await Promise.all([db.from('movies').select('*').order('created_at').limit(1000),db.from('screenings').select('*').gte('starts_at',new Date().toISOString()).order('starts_at').limit(1000),admin.from('screens').select('id,cinema_id')]);
  if(ms.error || ss.error || screens.error) throw new Error('Unable to load the cinema catalogue. Please try again.');
  const movies:Movie[]=await Promise.all((ms.data ?? []).map(async m=>{
    const poster=await admin.storage.from('movie-posters').createSignedUrl(m.poster_path,3600);
    return {id:m.id,title:m.title,tagline:m.tagline,synopsis:m.synopsis,genres:m.genres,minutes:m.runtime,duration:`${Math.floor(m.runtime/60)}h ${String(m.runtime%60).padStart(2,'0')}m`,language:m.language,rating:m.rating,score:Number(m.score),poster:poster.data?.signedUrl ?? '',status:m.status==='published'?'now':'soon',moods:m.moods};
  }));
  const shows:Show[]=(ss.data ?? []).flatMap(s=>{
    const screen=screens.data?.find(x=>x.id===s.screen_id);if(!screen)return [];
    return [{id:s.id,movieId:s.movie_id,cinemaId:screen.cinema_id,date:nepalDate(new Date(s.starts_at)),time:new Date(s.starts_at).toLocaleTimeString('en-US',{timeZone:'Asia/Kathmandu',hour:'numeric',minute:'2-digit'}),format:s.format as Show['format']}];
  });
  return {movies,shows};
});
export const getAdminData=createServerFn({method:'POST'}).middleware([requireAdmin]).handler(async({context})=>{
  const [movies,screenings,screens,bookings]=await Promise.all([context.supabase.from('movies').select('*').order('created_at',{ascending:false}).limit(1000),context.supabase.from('screenings').select('*').order('starts_at',{ascending:false}).limit(1000),context.supabase.from('screens').select('*'),context.supabase.from('bookings').select('id,ref,screening_id,seats,total,status,created_at,movie_title').order('created_at',{ascending:false}).limit(1000)]);
  if(movies.error||screenings.error||screens.error||bookings.error) throw new Error('Unable to load staff data.');
  const posters=await Promise.all((movies.data??[]).map(async m=>({id:m.id,url:(await context.supabase.storage.from('movie-posters').createSignedUrl(m.poster_path,3600)).data?.signedUrl??''})));
  return {movies:movies.data??[],screenings:screenings.data??[],screens:screens.data??[],bookings:bookings.data??[],posters};
});
function managementError(error: {message:string;code?:string}) {
  if(error.code==='23P01') return 'This screening overlaps another screening or its buffer in the same screen.';
  if(error.message.includes('Confirmed bookings')||error.message.includes('confirmed bookings')||error.message.includes('cannot be deleted')||error.message.includes('future start')) return error.message;
  return 'Unable to save. Check the details and try again.';
}
export const saveMovie=createServerFn({method:'POST'}).middleware([requireAdmin]).inputValidator((input:unknown)=>movieSchema.parse(input)).handler(async({data,context})=>{
  const {id,...values}=data;
  const file=await context.supabase.storage.from('movie-posters').list(values.poster_path.split('/').slice(0,-1).join('/'),{search:values.poster_path.split('/').at(-1) ?? ''});
  if(file.error||!file.data?.some(f=>f.name===values.poster_path.split('/').at(-1))) return {error:'Upload the poster before saving.'};
  const result=id?await context.supabase.from('movies').update(values).eq('id',id).select('id').single():await context.supabase.from('movies').insert(values).select('id').single();
  return result.error?{error:managementError(result.error)}:{id:result.data.id};
});
export const deleteMovie=createServerFn({method:'POST'}).middleware([requireAdmin]).inputValidator((input:unknown)=>z.object({id:z.string().min(1).max(100)}).parse(input)).handler(async({data,context})=>{
  const result=await context.supabase.from('movies').delete().eq('id',data.id).select('id').single();
  return result.error?{error:managementError(result.error)}:{success:true};
});
export const saveScreening=createServerFn({method:'POST'}).middleware([requireAdmin]).inputValidator((input:unknown)=>screeningSchema.parse(input)).handler(async({data,context})=>{
  const {id,...values}=data;
  const result=id?await context.supabase.from('screenings').update(values).eq('id',id).select('id').single():await context.supabase.from('screenings').insert({...values,ends_at:values.starts_at,occupied_until:values.starts_at}).select('id').single();
  return result.error?{error:managementError(result.error)}:{id:result.data.id};
});