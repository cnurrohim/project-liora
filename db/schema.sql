--
-- PostgreSQL database dump
--

\restrict B7UKPm6sWpqPcQmYMdoastAOplRdt6Jz5ZB4W7ed56mZHryEaDuv5ZRmulTmsq1

-- Dumped from database version 17.6 (Ubuntu 17.6-1build1)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1build1)

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
-- Name: inventory; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA inventory;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: reference_type_enum; Type: TYPE; Schema: inventory; Owner: -
--

CREATE TYPE inventory.reference_type_enum AS ENUM (
    'purchase_order',
    'stock_adjustment',
    'purchase_receive',
    'goods_receipt',
    'goods_issue',
    'transfer',
    'stock_opname'
);


--
-- Name: status_enum; Type: TYPE; Schema: inventory; Owner: -
--

CREATE TYPE inventory.status_enum AS ENUM (
    'draft',
    'confirmed',
    'received',
    'cancelled'
);


--
-- Name: generate_adjustment_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.generate_adjustment_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month  INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO inventory.adjustment_number_counters(year, month, counter)
    VALUES (v_year, v_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET counter = inventory.adjustment_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: ADJ-YYYY-MM-XXXX
    RETURN 'ADJ-'
        || v_year::text || '-'
        || lpad(v_month::text, 2, '0') || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$;


--
-- Name: generate_issue_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.generate_issue_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month  INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO inventory.issue_number_counters(year, month, counter)
    VALUES (v_year, v_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET counter = inventory.issue_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: GI-YYYY-MM-XXXX
    RETURN 'GI-'
        || v_year::text || '-'
        || lpad(v_month::text, 2, '0') || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$;


--
-- Name: generate_opname_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.generate_opname_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO inventory.opname_number_counters(year, counter)
    VALUES (v_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET counter = inventory.opname_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: OPN-YYYY-XXXX
    RETURN 'OPN-'
        || v_year::text || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$;


--
-- Name: generate_order_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.generate_order_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month  INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO inventory.order_number_counters(year, month, counter)
    VALUES (v_year, v_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET counter = inventory.order_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format jadi PO-YYYY-MM-XXXX
    RETURN 'PO-'
        || v_year::text || '-'
        || lpad(v_month::text, 2, '0') || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$;


--
-- Name: generate_receipt_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.generate_receipt_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month  INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO inventory.receipt_number_counters(year, month, counter)
    VALUES (v_year, v_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET counter = inventory.receipt_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: GR-YYYY-MM-XXXX
    RETURN 'GR-'
        || v_year::text || '-'
        || lpad(v_month::text, 2, '0') || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$;


--
-- Name: set_adjustment_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.set_adjustment_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.adjustment_number IS NULL THEN
        NEW.adjustment_number := inventory.generate_adjustment_number();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_issue_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.set_issue_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.issue_number IS NULL THEN
        NEW.issue_number := inventory.generate_issue_number();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_opname_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.set_opname_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.opname_number IS NULL THEN
        NEW.opname_number := inventory.generate_opname_number();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_order_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.set_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := inventory.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_receipt_number(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.set_receipt_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := inventory.generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: inventory; Owner: -
--

CREATE FUNCTION inventory.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adjustment_number_counters; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.adjustment_number_counters (
    year integer NOT NULL,
    month integer NOT NULL,
    counter integer DEFAULT 0 NOT NULL
);


--
-- Name: goods_issue_items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.goods_issue_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goods_issue_id uuid NOT NULL,
    item_id uuid NOT NULL,
    source_location_id uuid NOT NULL,
    target_location_id uuid,
    quantity numeric NOT NULL,
    notes text,
    CONSTRAINT goods_issue_items_quantity_check CHECK ((quantity > (0)::numeric))
);


--
-- Name: goods_issues; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.goods_issues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    issue_number text NOT NULL,
    issue_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: goods_receipt_items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.goods_receipt_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goods_receipt_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity numeric NOT NULL,
    notes text,
    CONSTRAINT goods_receipt_items_quantity_check CHECK ((quantity > (0)::numeric))
);


--
-- Name: goods_receipts; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.goods_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    receipt_number text NOT NULL,
    supplier_id uuid,
    receipt_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    location_id uuid NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: issue_number_counters; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.issue_number_counters (
    year integer NOT NULL,
    month integer NOT NULL,
    counter integer DEFAULT 0 NOT NULL
);


--
-- Name: items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: TABLE items; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON TABLE inventory.items IS 'Tabel menyimpan informasi barang di gudang';


--
-- Name: COLUMN items.sku; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.items.sku IS 'Kode unik barang (SKU)';


--
-- Name: COLUMN items.name; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.items.name IS 'Nama barang';


--
-- Name: COLUMN items.min_stock; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.items.min_stock IS 'Minimal stok untuk trigger reorder';


--
-- Name: opname_number_counters; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.opname_number_counters (
    year integer NOT NULL,
    counter integer DEFAULT 0 NOT NULL
);


--
-- Name: order_number_counters; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.order_number_counters (
    year integer NOT NULL,
    month integer NOT NULL,
    counter integer DEFAULT 0 NOT NULL
);


--
-- Name: purchase_order_items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.purchase_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    item_id uuid NOT NULL,
    qty integer NOT NULL,
    price numeric(18,2),
    received_qty integer DEFAULT 0
);


--
-- Name: TABLE purchase_order_items; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON TABLE inventory.purchase_order_items IS 'Daftar item di setiap PO';


--
-- Name: COLUMN purchase_order_items.qty; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.purchase_order_items.qty IS 'Jumlah barang dipesan';


--
-- Name: COLUMN purchase_order_items.received_qty; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.purchase_order_items.received_qty IS 'Jumlah barang yang sudah diterima';


--
-- Name: purchase_orders; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    supplier_id uuid NOT NULL,
    order_date date DEFAULT CURRENT_DATE NOT NULL,
    status inventory.status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    created_by uuid,
    expected_date date DEFAULT (CURRENT_DATE + '1 day'::interval) NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: TABLE purchase_orders; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON TABLE inventory.purchase_orders IS 'Tabel purchase order barang masuk dari supplier';


--
-- Name: COLUMN purchase_orders.order_number; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.purchase_orders.order_number IS 'Nomor unik PO';


--
-- Name: COLUMN purchase_orders.supplier_id; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.purchase_orders.supplier_id IS 'Supplier terkait';


--
-- Name: COLUMN purchase_orders.status; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.purchase_orders.status IS 'Status PO: draft, confirmed, received, cancelled';


--
-- Name: COLUMN purchase_orders.created_by; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.purchase_orders.created_by IS 'User yang membuat PO';


--
-- Name: purchase_receive_items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.purchase_receive_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_receive_id uuid NOT NULL,
    item_id uuid NOT NULL,
    qty numeric(18,2) NOT NULL,
    CONSTRAINT purchase_receive_items_qty_check CHECK ((qty > (0)::numeric))
);


--
-- Name: purchase_receives; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.purchase_receives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    receive_date date DEFAULT CURRENT_DATE NOT NULL,
    received_by uuid NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now(),
    location_id uuid NOT NULL
);


--
-- Name: receipt_number_counters; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.receipt_number_counters (
    year integer NOT NULL,
    month integer NOT NULL,
    counter integer DEFAULT 0 NOT NULL
);


--
-- Name: stock_adjustment_items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_adjustment_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adjustment_id uuid NOT NULL,
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    quantity_diff numeric(14,2) NOT NULL,
    notes text,
    quantity_before numeric(14,2)
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adjustment_number character varying(50) NOT NULL,
    adjustment_date date DEFAULT CURRENT_DATE NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: stock_balances; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_balances (
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    qty integer DEFAULT 0 NOT NULL
);


--
-- Name: stock_locations; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: stock_movements; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    movement_type text NOT NULL,
    adjustment_direction text NOT NULL,
    qty integer NOT NULL,
    balance_after integer NOT NULL,
    reference_id uuid,
    reference_type inventory.reference_type_enum NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now(),
    created_by uuid,
    source_location_id uuid,
    target_location_id uuid,
    CONSTRAINT movement_direction_consistency CHECK ((((movement_type = 'inbound'::text) AND (adjustment_direction = 'increase'::text)) OR ((movement_type = 'outbound'::text) AND (adjustment_direction = 'decrease'::text)) OR ((movement_type = 'adjustment'::text) AND (adjustment_direction = ANY (ARRAY['increase'::text, 'decrease'::text]))))),
    CONSTRAINT stock_movements_adjustment_direction_check CHECK ((adjustment_direction = ANY (ARRAY['increase'::text, 'decrease'::text]))),
    CONSTRAINT stock_movements_movement_type_check CHECK ((movement_type = ANY (ARRAY['inbound'::text, 'outbound'::text, 'adjustment'::text]))),
    CONSTRAINT stock_movements_qty_check CHECK ((qty > 0))
);


--
-- Name: TABLE stock_movements; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON TABLE inventory.stock_movements IS 'Ledger stok: semua pergerakan barang masuk, keluar, dan penyesuaian';


--
-- Name: COLUMN stock_movements.movement_type; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.movement_type IS 'Tipe pergerakan: inbound, outbound, atau adjustment';


--
-- Name: COLUMN stock_movements.adjustment_direction; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.adjustment_direction IS 'Arah penyesuaian: increase atau decrease';


--
-- Name: COLUMN stock_movements.qty; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.qty IS 'Jumlah barang, selalu positif';


--
-- Name: COLUMN stock_movements.balance_after; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.balance_after IS 'Saldo stok setelah transaksi';


--
-- Name: COLUMN stock_movements.reference_id; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.reference_id IS 'Referensi ke tabel terkait (PO, SO, stock_opname, dsb)';


--
-- Name: COLUMN stock_movements.reference_type; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.reference_type IS 'Tipe referensi, menentukan tabel asal';


--
-- Name: COLUMN stock_movements.note; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.note IS 'Catatan tambahan';


--
-- Name: COLUMN stock_movements.created_by; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.stock_movements.created_by IS 'User yang membuat transaksi';


--
-- Name: stock_opname_items; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_opname_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    opname_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity_counted numeric(14,2) NOT NULL,
    quantity_system numeric(14,2) NOT NULL
);


--
-- Name: stock_opnames; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.stock_opnames (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id uuid NOT NULL,
    opname_date date NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by uuid,
    approved_by uuid,
    opname_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    updated_by uuid,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    review_note text,
    canceled_at timestamp with time zone,
    canceled_by uuid,
    finalized_at timestamp with time zone,
    finalized_by uuid
);


--
-- Name: suppliers; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    contact text,
    address text,
    deleted_at timestamp with time zone
);


--
-- Name: TABLE suppliers; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON TABLE inventory.suppliers IS 'Tabel menyimpan informasi supplier';


--
-- Name: COLUMN suppliers.name; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.suppliers.name IS 'Nama supplier';


--
-- Name: COLUMN suppliers.contact; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.suppliers.contact IS 'Kontak supplier';


--
-- Name: COLUMN suppliers.address; Type: COMMENT; Schema: inventory; Owner: -
--

COMMENT ON COLUMN inventory.suppliers.address IS 'Alamat supplier';


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_name text NOT NULL,
    app_logo text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    path text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    description text,
    deleted_at timestamp with time zone
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
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
    icon_color character varying(7),
    deleted_at timestamp with time zone
);


--
-- Name: COLUMN menu_items.menu_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.menu_key IS 'contoh: main, settings, preferences dll';


--
-- Name: COLUMN menu_items.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.type IS 'GROUP, ROUTE, COMMAND';


--
-- Name: COLUMN menu_items.route; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.route IS 'jika menu mengakses halaman tertentu: contoh: /pages/preferences';


--
-- Name: COLUMN menu_items.command; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.command IS 'jika menu menjalan suatu fungsi contoh: logout';


--
-- Name: COLUMN menu_items.mode; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.mode IS 'sliding atau context (context belum ada implementasinya)';


--
-- Name: COLUMN menu_items.alignment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.alignment IS 'posisi menu, start atau end';


--
-- Name: COLUMN menu_items.ordinal; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.ordinal IS 'urutan menu';


--
-- Name: COLUMN menu_items.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.description IS 'deskripsi menu (opsional)';


--
-- Name: COLUMN menu_items.icon_color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.icon_color IS 'warna icon pakai format hex';


--
-- Name: menu_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_permissions (
    menu_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    domain character varying(50) NOT NULL,
    description text,
    deleted_at timestamp with time zone
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    deleted_at timestamp with time zone
);


--
-- Name: user_dashboard_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_dashboard_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    layout jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_departments (
    user_id uuid NOT NULL,
    department_id uuid NOT NULL
);


--
-- Name: user_layout_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_layout_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    layout jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    default_page character varying(255),
    default_new_tab character varying(255),
    theme character varying(50) DEFAULT 'light'::character varying NOT NULL
);


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_permissions (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    granted boolean DEFAULT true NOT NULL
);


--
-- Name: user_pinned_menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_pinned_menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    menu_id uuid NOT NULL,
    pinned_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    is_default boolean DEFAULT false
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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
    active_role_id uuid,
    profile_photo text,
    phone_number character varying(20),
    address text,
    deleted_at timestamp with time zone
);


--
-- Name: adjustment_number_counters adjustment_number_counters_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.adjustment_number_counters
    ADD CONSTRAINT adjustment_number_counters_pkey PRIMARY KEY (year, month);


--
-- Name: goods_issue_items goods_issue_items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_issue_items
    ADD CONSTRAINT goods_issue_items_pkey PRIMARY KEY (id);


--
-- Name: goods_issues goods_issues_issue_number_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_issues
    ADD CONSTRAINT goods_issues_issue_number_key UNIQUE (issue_number);


--
-- Name: goods_issues goods_issues_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_issues
    ADD CONSTRAINT goods_issues_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_items goods_receipt_items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipts
    ADD CONSTRAINT goods_receipts_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_receipt_number_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipts
    ADD CONSTRAINT goods_receipts_receipt_number_key UNIQUE (receipt_number);


--
-- Name: issue_number_counters issue_number_counters_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.issue_number_counters
    ADD CONSTRAINT issue_number_counters_pkey PRIMARY KEY (year, month);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: items items_sku_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.items
    ADD CONSTRAINT items_sku_key UNIQUE (sku);


--
-- Name: opname_number_counters opname_number_counters_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.opname_number_counters
    ADD CONSTRAINT opname_number_counters_pkey PRIMARY KEY (year);


--
-- Name: order_number_counters order_number_counters_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.order_number_counters
    ADD CONSTRAINT order_number_counters_pkey PRIMARY KEY (year, month);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_order_number_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_orders
    ADD CONSTRAINT purchase_orders_order_number_key UNIQUE (order_number);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_receive_items purchase_receive_items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_receive_items
    ADD CONSTRAINT purchase_receive_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_receives purchase_receives_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_receives
    ADD CONSTRAINT purchase_receives_pkey PRIMARY KEY (id);


--
-- Name: receipt_number_counters receipt_number_counters_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.receipt_number_counters
    ADD CONSTRAINT receipt_number_counters_pkey PRIMARY KEY (year, month);


--
-- Name: stock_adjustment_items stock_adjustment_items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_adjustment_number_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustments
    ADD CONSTRAINT stock_adjustments_adjustment_number_key UNIQUE (adjustment_number);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_balances stock_balances_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_balances
    ADD CONSTRAINT stock_balances_pkey PRIMARY KEY (item_id, location_id);


--
-- Name: stock_locations stock_locations_code_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_locations
    ADD CONSTRAINT stock_locations_code_key UNIQUE (code);


--
-- Name: stock_locations stock_locations_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_locations
    ADD CONSTRAINT stock_locations_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock_opname_items stock_opname_items_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_opname_items
    ADD CONSTRAINT stock_opname_items_pkey PRIMARY KEY (id);


--
-- Name: stock_opnames stock_opnames_opname_number_key; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_opnames
    ADD CONSTRAINT stock_opnames_opname_number_key UNIQUE (opname_number);


--
-- Name: stock_opnames stock_opnames_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_opnames
    ADD CONSTRAINT stock_opnames_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menu_permissions menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_pkey PRIMARY KEY (menu_id, permission_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: permissions unique_domain_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT unique_domain_name UNIQUE (domain, name);


--
-- Name: user_dashboard_preferences user_dashboard_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_preferences
    ADD CONSTRAINT user_dashboard_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_preferences user_dashboard_preferences_user_role_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_preferences
    ADD CONSTRAINT user_dashboard_preferences_user_role_unique UNIQUE (user_id, role_id);


--
-- Name: user_departments user_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_pkey PRIMARY KEY (user_id, department_id);


--
-- Name: user_layout_preferences user_layout_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_layout_preferences user_layout_preferences_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: user_pinned_menus user_pinned_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_pkey PRIMARY KEY (id);


--
-- Name: user_pinned_menus user_pinned_menus_user_id_role_id_menu_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_user_id_role_id_menu_id_key UNIQUE (user_id, role_id, menu_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_goods_receipts_deleted_at_null; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_goods_receipts_deleted_at_null ON inventory.goods_receipts USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_items_deleted_at_null; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_items_deleted_at_null ON inventory.items USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_purchase_orders_deleted_at_null; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_purchase_orders_deleted_at_null ON inventory.purchase_orders USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_adjustments_deleted_at_null; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_stock_adjustments_deleted_at_null ON inventory.stock_adjustments USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_locations_code; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_stock_locations_code ON inventory.stock_locations USING btree (code);


--
-- Name: idx_stock_locations_deleted_at_null; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_stock_locations_deleted_at_null ON inventory.stock_locations USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_locations_type; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_stock_locations_type ON inventory.stock_locations USING btree (type);


--
-- Name: idx_suppliers_deleted_at_null; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_suppliers_deleted_at_null ON inventory.suppliers USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_departments_deleted_at_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_deleted_at_null ON public.departments USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_items_deleted_at_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_deleted_at_null ON public.menu_items USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_permissions_deleted_at_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_permissions_deleted_at_null ON public.permissions USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_roles_deleted_at_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roles_deleted_at_null ON public.roles USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: idx_users_deleted_at_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_deleted_at_null ON public.users USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: stock_adjustments trg_set_adjustment_number; Type: TRIGGER; Schema: inventory; Owner: -
--

CREATE TRIGGER trg_set_adjustment_number BEFORE INSERT ON inventory.stock_adjustments FOR EACH ROW EXECUTE FUNCTION inventory.set_adjustment_number();


--
-- Name: goods_issues trg_set_issue_number; Type: TRIGGER; Schema: inventory; Owner: -
--

CREATE TRIGGER trg_set_issue_number BEFORE INSERT ON inventory.goods_issues FOR EACH ROW EXECUTE FUNCTION inventory.set_issue_number();


--
-- Name: stock_opnames trg_set_opname_number; Type: TRIGGER; Schema: inventory; Owner: -
--

CREATE TRIGGER trg_set_opname_number BEFORE INSERT ON inventory.stock_opnames FOR EACH ROW EXECUTE FUNCTION inventory.set_opname_number();


--
-- Name: purchase_orders trg_set_order_number; Type: TRIGGER; Schema: inventory; Owner: -
--

CREATE TRIGGER trg_set_order_number BEFORE INSERT ON inventory.purchase_orders FOR EACH ROW EXECUTE FUNCTION inventory.set_order_number();


--
-- Name: goods_receipts trg_set_receipt_number; Type: TRIGGER; Schema: inventory; Owner: -
--

CREATE TRIGGER trg_set_receipt_number BEFORE INSERT ON inventory.goods_receipts FOR EACH ROW EXECUTE FUNCTION inventory.set_receipt_number();


--
-- Name: stock_locations trg_stock_locations_updated; Type: TRIGGER; Schema: inventory; Owner: -
--

CREATE TRIGGER trg_stock_locations_updated BEFORE UPDATE ON inventory.stock_locations FOR EACH ROW EXECUTE FUNCTION inventory.set_updated_at();


--
-- Name: goods_issue_items goods_issue_items_goods_issue_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_issue_items
    ADD CONSTRAINT goods_issue_items_goods_issue_id_fkey FOREIGN KEY (goods_issue_id) REFERENCES inventory.goods_issues(id) ON DELETE CASCADE;


--
-- Name: goods_issue_items goods_issue_items_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_issue_items
    ADD CONSTRAINT goods_issue_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: goods_issues goods_issues_created_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_issues
    ADD CONSTRAINT goods_issues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: goods_receipt_items goods_receipt_items_goods_receipt_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_goods_receipt_id_fkey FOREIGN KEY (goods_receipt_id) REFERENCES inventory.goods_receipts(id) ON DELETE CASCADE;


--
-- Name: goods_receipt_items goods_receipt_items_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: goods_receipts goods_receipts_created_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipts
    ADD CONSTRAINT goods_receipts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: goods_receipts goods_receipts_location_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipts
    ADD CONSTRAINT goods_receipts_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory.stock_locations(id);


--
-- Name: goods_receipts goods_receipts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.goods_receipts
    ADD CONSTRAINT goods_receipts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES inventory.suppliers(id);


--
-- Name: purchase_order_items purchase_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_order_items
    ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES inventory.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_approved_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES inventory.suppliers(id);


--
-- Name: purchase_receive_items purchase_receive_items_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_receive_items
    ADD CONSTRAINT purchase_receive_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: purchase_receive_items purchase_receive_items_purchase_receive_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_receive_items
    ADD CONSTRAINT purchase_receive_items_purchase_receive_id_fkey FOREIGN KEY (purchase_receive_id) REFERENCES inventory.purchase_receives(id) ON DELETE CASCADE;


--
-- Name: purchase_receives purchase_receives_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_receives
    ADD CONSTRAINT purchase_receives_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES inventory.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_receives purchase_receives_received_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.purchase_receives
    ADD CONSTRAINT purchase_receives_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.users(id);


--
-- Name: stock_adjustment_items stock_adjustment_items_adjustment_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_adjustment_id_fkey FOREIGN KEY (adjustment_id) REFERENCES inventory.stock_adjustments(id) ON DELETE CASCADE;


--
-- Name: stock_adjustment_items stock_adjustment_items_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: stock_adjustment_items stock_adjustment_items_location_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory.stock_locations(id);


--
-- Name: stock_adjustments stock_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_adjustments
    ADD CONSTRAINT stock_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_balances stock_balances_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_balances
    ADD CONSTRAINT stock_balances_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_movements
    ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: stock_opname_items stock_opname_items_item_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_opname_items
    ADD CONSTRAINT stock_opname_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory.items(id);


--
-- Name: stock_opname_items stock_opname_items_opname_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_opname_items
    ADD CONSTRAINT stock_opname_items_opname_id_fkey FOREIGN KEY (opname_id) REFERENCES inventory.stock_opnames(id) ON DELETE CASCADE;


--
-- Name: stock_opnames stock_opnames_location_id_fkey; Type: FK CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.stock_opnames
    ADD CONSTRAINT stock_opnames_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory.stock_locations(id);


--
-- Name: departments departments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_permissions menu_permissions_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_permissions menu_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_dashboard_preferences user_dashboard_preferences_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_preferences
    ADD CONSTRAINT user_dashboard_preferences_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_dashboard_preferences user_dashboard_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_preferences
    ADD CONSTRAINT user_dashboard_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_departments user_departments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_departments user_departments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_layout_preferences user_layout_preferences_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_layout_preferences user_layout_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_layout_preferences
    ADD CONSTRAINT user_layout_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_pinned_menus user_pinned_menus_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: user_pinned_menus user_pinned_menus_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_pinned_menus user_pinned_menus_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_menus
    ADD CONSTRAINT user_pinned_menus_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict B7UKPm6sWpqPcQmYMdoastAOplRdt6Jz5ZB4W7ed56mZHryEaDuv5ZRmulTmsq1

