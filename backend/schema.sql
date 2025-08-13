--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Ubuntu 17.5-0ubuntu0.25.04.1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-0ubuntu0.25.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.app_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_name text NOT NULL,
    app_logo text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.app_settings OWNER TO liora;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    path text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    description text
);


ALTER TABLE public.departments OWNER TO liora;

--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    menu_key character varying(50),
    type character varying(20) NOT NULL,
    label character varying(100) NOT NULL,
    icon character varying(100),
    route character varying(255),
    command character varying(100),
    mode character varying(20),
    alignment character varying(20),
    "position" integer DEFAULT 0,
    ordinal integer DEFAULT 0,
    description character varying(255),
    icon_color character varying(7)
);


ALTER TABLE public.menu_items OWNER TO liora;

--
-- Name: COLUMN menu_items.menu_key; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.menu_key IS 'contoh: main, settings, preferences dll';


--
-- Name: COLUMN menu_items.type; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.type IS 'GROUP, ROUTE, COMMAND';


--
-- Name: COLUMN menu_items.route; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.route IS 'jika menu mengakses halaman tertentu: contoh: /pages/preferences';


--
-- Name: COLUMN menu_items.command; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.command IS 'jika menu menjalan suatu fungsi contoh: logout';


--
-- Name: COLUMN menu_items.mode; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.mode IS 'sliding atau context (context belum ada implementasinya)';


--
-- Name: COLUMN menu_items.alignment; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.alignment IS 'posisi menu, start atau end';


--
-- Name: COLUMN menu_items.ordinal; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.ordinal IS 'urutan menu';


--
-- Name: COLUMN menu_items.description; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.description IS 'deskripsi menu (opsional)';


--
-- Name: COLUMN menu_items.icon_color; Type: COMMENT; Schema: public; Owner: liora
--

COMMENT ON COLUMN public.menu_items.icon_color IS 'warna icon pakai format hex';


--
-- Name: menu_permissions; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.menu_permissions (
    menu_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.menu_permissions OWNER TO liora;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    domain character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO liora;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO liora;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO liora;

--
-- Name: user_departments; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.user_departments (
    user_id uuid NOT NULL,
    department_id uuid NOT NULL
);


ALTER TABLE public.user_departments OWNER TO liora;

--
-- Name: user_layout_preferences; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.user_layout_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    layout jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_layout_preferences OWNER TO liora;

--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.user_permissions (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    granted boolean DEFAULT true NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO liora;

--
-- Name: user_pinned_menus; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.user_pinned_menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    menu_id uuid NOT NULL,
    pinned_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_pinned_menus OWNER TO liora;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    is_default boolean DEFAULT false
);


ALTER TABLE public.user_roles OWNER TO liora;

--
-- Name: users; Type: TABLE; Schema: public; Owner: liora
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    username character varying(50),
    email character varying(100) NOT NULL,
    password text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    active_role_id uuid
);


ALTER TABLE public.users OWNER TO liora;

--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menu_permissions menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_pkey PRIMARY KEY (menu_id, permission_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: permissions unique_domain_name; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT unique_domain_name UNIQUE (domain, name);


--
-- Name: user_departments user_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_pkey PRIMARY KEY (user_id, department_id);


--
-- Name: user_layout_preferences user_layout_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_layout_preferences user_layout_preferences_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: user_pinned_menus user_pinned_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_pkey PRIMARY KEY (id);


--
-- Name: user_pinned_menus user_pinned_menus_user_id_role_id_menu_id_key; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_user_id_role_id_menu_id_key UNIQUE (user_id, role_id, menu_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: departments departments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_permissions menu_permissions_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_permissions menu_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_departments user_departments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_departments user_departments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_layout_preferences user_layout_preferences_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_layout_preferences user_layout_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_pinned_menus user_pinned_menus_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: user_pinned_menus user_pinned_menus_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_pinned_menus user_pinned_menus_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: liora
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

