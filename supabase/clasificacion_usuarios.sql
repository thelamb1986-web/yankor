-- Clasificación de perfiles en public.users
-- consultor: perfil interno YANKOR (solo datos de acceso)
-- cliente: perfil comercial; usa el resto de columnas y la tabla public.clientes

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_rol_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_rol_check
  CHECK (rol IN ('consultor', 'cliente', 'admin'));

ALTER TABLE public.users
  ALTER COLUMN rol SET DEFAULT 'cliente';

COMMENT ON COLUMN public.users.rol IS 'consultor | cliente | admin';
COMMENT ON COLUMN public.users.telefono IS 'Aplica al perfil cliente';
COMMENT ON COLUMN public.users.empresa IS 'Aplica al perfil cliente (razón social / RFC auxiliar)';

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS rfc text;

CREATE UNIQUE INDEX IF NOT EXISTS clientes_email_unique ON public.clientes (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clientes_rfc_unique ON public.clientes (rfc) WHERE rfc IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clientes_user_id_unique ON public.clientes (user_id) WHERE user_id IS NOT NULL;

-- Consultor YANKOR
UPDATE public.users
SET rol = 'consultor'
WHERE lower(email) = 'bruno@yukti.mx';

-- El resto de usuarios no-admin quedan como cliente
UPDATE public.users
SET rol = 'cliente'
WHERE lower(email) <> 'bruno@yukti.mx'
  AND lower(email) <> 'admin@yankor.com'
  AND rol IS DISTINCT FROM 'admin';
