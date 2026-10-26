import { z } from 'zod';

export const GENRES = ['Action','Adventure','Animation','Comedy','Drama','Family','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller'];
export const movieSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  title: z.string().trim().min(1,'Movie title is required.').max(150),
  genres: z.array(z.string().min(1).max(40)).min(1,'Select at least one genre.').max(8),
  synopsis: z.string().trim().min(1,'Synopsis is required.').max(5000),
  runtime: z.number().int().min(1).max(600),
  status: z.enum(['draft','scheduled','published']),
  poster_path: z.string().min(1,'Upload a poster.').max(250).regex(/^[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/,'Choose a valid poster image.'),
  language: z.string().trim().min(1).max(50),
  rating: z.string().trim().min(1).max(20),
  tagline: z.string().trim().max(300),
});
export type MovieInput = z.infer<typeof movieSchema>;
export const screeningSchema = z.object({
  id: z.string().min(1).max(200).optional(), movie_id: z.string().min(1).max(100),
  screen_id: z.string().min(1).max(100), starts_at: z.string().datetime(),
  buffer_minutes: z.number().int().min(0).max(120), format: z.enum(['2D','3D','IMAX']),
  status: z.enum(['scheduled','cancelled']),
});
export const POSTER_LIMIT = 5 * 1024 * 1024;
export function validatePoster(file: Pick<File,'type'|'size'>) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
  if (file.size > POSTER_LIMIT || file.size === 0) throw new Error('Poster must be between 1 byte and 5 MB.');
}
export function nepalStart(date: string, time: string) {
  const parsed = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(date);
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).parse(time);
  const d = new Date(`${parsed}T${time}:00+05:45`);
  if (!Number.isFinite(d.getTime()) || nepalDate(d) !== date) throw new Error('Choose a valid date.');
  return d.toISOString();
}
export function nepalDate(d: Date = new Date()) { return new Date(d.getTime()+345*60000).toISOString().slice(0,10); }
export function nepalTime(iso: string) { return new Date(new Date(iso).getTime()+345*60000).toISOString().slice(11,16); }
export function endTime(start: string, runtime: number) { return new Date(new Date(start).getTime()+runtime*60000).toISOString(); }
export function overlaps(a: {start: string; runtime: number; buffer: number}, b: {start: string; runtime: number; buffer: number}) {
  return new Date(a.start).getTime() < new Date(b.start).getTime()+(b.runtime+b.buffer)*60000 && new Date(b.start).getTime() < new Date(a.start).getTime()+(a.runtime+a.buffer)*60000;
}