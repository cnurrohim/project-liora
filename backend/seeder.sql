-- seeder.sql
-- username: admin
-- password: admin
-- password: 123 : $2b$10$T0wdCaRfX3h.VubhCOR0ueAwRD9gaAQd3u1Kv27w6z0YISc4f9P3a
INSERT INTO public.users (
    id,
    name,
    username,
    email,
    password,
    is_active,
    active_role_id
)
VALUES (
    gen_random_uuid(),
    'Administrator',
    'admin',
    'admin@example.com',
    '$2b$10$DZOJBA1EmAQ6YAy7KhODvOSvx8ne861jQhwKHaFcfD6QiZ2eukHDa',
    true,
    NULL
)
ON CONFLICT (username) DO NOTHING;
