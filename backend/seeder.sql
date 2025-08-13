-- seeder.sql
-- username: admin
-- password: admin
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
