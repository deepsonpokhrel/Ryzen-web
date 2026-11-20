DROP POLICY IF EXISTS public_screens ON public.screens;
CREATE POLICY admin_screens ON public.screens FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role));
GRANT SELECT ON public.screens TO service_role;
DROP POLICY IF EXISTS poster_public_read ON storage.objects;