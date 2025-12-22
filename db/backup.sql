--
-- PostgreSQL database dump
--

\restrict CdvNkKZazDTgEh34lXN1jM9QeblMQJKHBPRjqrEYJb7IH1roEx93YegGL3O7etp

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
-- Name: tablefunc; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA inventory;


--
-- Name: EXTENSION tablefunc; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';


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


--
-- Name: seed_purchase_order_items(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seed_purchase_order_items() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    po_rec RECORD;
    item_rec RECORD;
    item_count INT;
BEGIN
    -- Loop tiap purchase order
    FOR po_rec IN SELECT id FROM inventory.purchase_orders LOOP
        
        -- Tentukan jumlah item (3–4)
        item_count := 3 + floor(random() * 2);

        -- Ambil item random sebanyak item_count
        FOR item_rec IN
            SELECT id FROM inventory.items
            ORDER BY random()
            LIMIT item_count
        LOOP

            INSERT INTO inventory.purchase_order_items (
                id,
                purchase_order_id,
                item_id,
                qty,
                price
            )
            VALUES (
                gen_random_uuid(),
                po_rec.id,
                item_rec.id,
                (1 + floor(random() * 5))::int,                    -- qty 1–5
                (100000 + random() * 500000)::numeric(18,2)        -- price 100k–600k
            );

        END LOOP;

    END LOOP;

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
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone
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
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone,
    notes text
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
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone
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
-- Data for Name: adjustment_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.adjustment_number_counters (year, month, counter) FROM stdin;
2025	12	5
\.


--
-- Data for Name: goods_issue_items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.goods_issue_items (id, goods_issue_id, item_id, source_location_id, target_location_id, quantity, notes) FROM stdin;
6ae58faa-f77a-4330-bd26-2b5fe6762e39	4e046b49-7476-4eb2-84b2-5162a7fb5dd2	fa77d16b-ba27-41d0-92ae-307788844f65	4f1c5549-89d7-4335-981e-d042996c550f	\N	1	
40f39896-3ea0-48f8-ac06-7bfb0d0bf3f9	904436da-29c0-424a-8d4c-c6e7e62b47d4	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	4f1c5549-89d7-4335-981e-d042996c550f	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	1	
5ac55ea6-b6cb-48d1-a73d-9b7f49d212d5	1eb05076-5ef9-43aa-8409-c14c99cbbd8b	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	4f1c5549-89d7-4335-981e-d042996c550f	\N	1	
921e4004-c113-4048-8710-b833badddadf	1eb05076-5ef9-43aa-8409-c14c99cbbd8b	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	4f1c5549-89d7-4335-981e-d042996c550f	\N	1	
e8bb1afb-5ecd-4247-a11d-bec354e0c5c7	995a76a9-75ae-4585-976f-ddfbf04ab09e	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	4f1c5549-89d7-4335-981e-d042996c550f	\N	1	
758bb7ff-1d33-48e8-8ba8-9b8ee15127f8	9f8dc96d-2319-4276-9a5f-ccc36d7a0ed3	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N	1	
62020473-0971-4175-b389-6aa82a4043f3	d6ab6924-ed48-4524-97a4-26c949142023	0624daad-fbd5-4957-a2a8-ddbc54fba5f5	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N	1	
\.


--
-- Data for Name: goods_issues; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.goods_issues (id, issue_number, issue_date, notes, created_at, created_by) FROM stdin;
4e046b49-7476-4eb2-84b2-5162a7fb5dd2	GI-2025-12-0001	2025-12-02	Returning bad item	2025-12-02 16:54:49.951381+07	566f6344-474a-43b5-a400-dfde48a6d0e3
904436da-29c0-424a-8d4c-c6e7e62b47d4	GI-2025-12-0002	2025-12-02	bad item returning it for repair	2025-12-02 16:56:50.445898+07	566f6344-474a-43b5-a400-dfde48a6d0e3
1eb05076-5ef9-43aa-8409-c14c99cbbd8b	GI-2025-12-0003	2025-12-04	New Installation	2025-12-04 10:39:58.977655+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4
995a76a9-75ae-4585-976f-ddfbf04ab09e	GI-2025-12-0004	2025-12-08	Damaged Inventory	2025-12-08 13:44:33.675295+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4
9f8dc96d-2319-4276-9a5f-ccc36d7a0ed3	GI-2025-12-0005	2025-12-08	Damaged items	2025-12-08 13:45:50.128289+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4
d6ab6924-ed48-4524-97a4-26c949142023	GI-2025-12-0006	2025-12-12	service	2025-12-12 20:17:45.305888+07	566f6344-474a-43b5-a400-dfde48a6d0e3
\.


--
-- Data for Name: goods_receipt_items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.goods_receipt_items (id, goods_receipt_id, item_id, quantity, notes) FROM stdin;
82d60f3a-ef62-4824-b5c8-871bf6f54956	ef774811-dc26-412f-867f-19031237c754	807d0a7e-7446-4a11-baa5-5693abbd3c57	10	
7eb6c49d-5df7-4e8a-a492-bbe4cba757b8	9e9a67ee-f7d7-490c-9a2f-b6064e5a2bd7	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	1	
158196df-87fe-4390-b376-d652004e60dc	87a15dba-e270-42b3-ab32-d2df9cee5759	55843c0d-d32d-4024-897c-854069db0f81	1	
8406432d-33ce-471b-b5bd-a726a2c518a8	21a072b1-8c69-4c75-bba9-1a8fc158f13f	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	1	
2136678c-0b2f-4304-99aa-62bab325ff87	a9271c4f-2d4d-49ac-98a5-44db9a0af12c	fa77d16b-ba27-41d0-92ae-307788844f65	2	
e9eccb2c-2f43-4736-8323-36c52ef6664b	182c1c96-659c-4034-a0ca-b8da96e873c7	d3c9af78-58bd-4649-a6da-19a07ae8844e	5	
4dd5fa4e-7d44-4e1d-9f21-d24b7bd4f402	182c1c96-659c-4034-a0ca-b8da96e873c7	db159f69-afbb-44bd-a04e-35880e5d408f	2	
7e3ad173-43f7-455e-bb3d-de40ff51666c	182c1c96-659c-4034-a0ca-b8da96e873c7	e15f9138-0b4f-4da6-b620-f3af2cc24df6	3	
eabacd1b-be17-4799-9698-1bff058ceed0	09563c43-bd85-47cd-905a-63e0d5b8dcf8	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	1	
4470ff88-9f33-47f7-ba8c-6821fd2945ad	ee272565-0ec5-46a2-a867-3fdfee99ea24	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	1	
\.


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.goods_receipts (id, receipt_number, supplier_id, receipt_date, notes, created_at, created_by, location_id, deleted_at) FROM stdin;
ef774811-dc26-412f-867f-19031237c754	GR-2025-12-0001	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-02	Gift from supplier	2025-12-02 16:31:14.611766+07	a13f2ee7-a32c-433d-88c6-d463803dfd8c	4f1c5549-89d7-4335-981e-d042996c550f	\N
9e9a67ee-f7d7-490c-9a2f-b6064e5a2bd7	GR-2025-12-0002	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-03	received newly repaired inventory	2025-12-03 23:38:40.495992+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	4f1c5549-89d7-4335-981e-d042996c550f	\N
87a15dba-e270-42b3-ab32-d2df9cee5759	GR-2025-12-0003	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-08	Supplier extra bonus	2025-12-08 10:23:02.118271+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
21a072b1-8c69-4c75-bba9-1a8fc158f13f	GR-2025-12-0004	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-12-08	Extra inbound item	2025-12-08 10:27:30.61265+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
a9271c4f-2d4d-49ac-98a5-44db9a0af12c	GR-2025-12-0005	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-08	Urgent Direct Purchase	2025-12-08 10:31:03.370898+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
182c1c96-659c-4034-a0ca-b8da96e873c7	GR-2025-12-0006	368f9a28-0dca-4d02-add7-14cdabedf31c	2025-12-13	Gift from supplier	2025-12-12 20:08:28.37505+07	566f6344-474a-43b5-a400-dfde48a6d0e3	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	\N
09563c43-bd85-47cd-905a-63e0d5b8dcf8	GR-2025-12-0007	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-11	returned warranty service	2025-12-12 20:09:25.928469+07	566f6344-474a-43b5-a400-dfde48a6d0e3	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
ee272565-0ec5-46a2-a867-3fdfee99ea24	GR-2025-12-0008	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-12	warranty	2025-12-12 20:11:36.153977+07	566f6344-474a-43b5-a400-dfde48a6d0e3	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	\N
\.


--
-- Data for Name: issue_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.issue_number_counters (year, month, counter) FROM stdin;
2025	12	6
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.items (id, sku, name, min_stock, deleted_at, updated_at) FROM stdin;
8c830d37-6be1-4a54-9e8b-d9fcdfafad16	ITM-0001	UTP Cable Cat6 100m	5	\N	\N
64bf77fb-feba-4e4c-aa73-b323b62a0bc7	ITM-0002	Gigabit Switch 24 Port	2	\N	\N
e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	ITM-0003	Patch Panel 24 Port	2	\N	\N
ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	ITM-0004	Router Mikrotik RB750	1	\N	\N
88eb8906-5332-456d-aa94-4aacedbf198f	ITM-0005	Unifi U6 Lite Access Point	4	\N	\N
d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	ITM-0006	Fiber Optic Cable SC-SC 20m	5	\N	\N
e321c296-e580-4da3-89ba-99fe46477ae1	ITM-0007	TP-Link Media Converter	4	\N	\N
7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	ITM-0008	RJ45 Connector Cat6	20	\N	\N
02540f95-d36f-4d7a-9eef-df9e84fe24ca	ITM-0009	IEC C13 Power Cable	5	\N	\N
25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	ITM-0010	APC UPS 1200VA	1	\N	\N
d3c9af78-58bd-4649-a6da-19a07ae8844e	ITM-0011	USB to Serial Converter	3	\N	\N
a880bcc5-d001-4ed1-9378-33e5f71bf3df	ITM-0012	42U Server Rack	1	\N	\N
3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	ITM-0013	Fiber Patch Panel 24 Port	1	\N	\N
0624daad-fbd5-4957-a2a8-ddbc54fba5f5	ITM-0014	Thinkpad T14 Laptop	1	\N	\N
1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	ITM-0015	Lenovo 24" Monitor	2	\N	\N
db159f69-afbb-44bd-a04e-35880e5d408f	ITM-0016	Logitech K120 Keyboard	5	\N	\N
e15f9138-0b4f-4da6-b620-f3af2cc24df6	ITM-0017	Logitech M100 Mouse	5	\N	\N
807d0a7e-7446-4a11-baa5-5693abbd3c57	ITM-0018	4-Port KVM Switch	1	\N	\N
55843c0d-d32d-4024-897c-854069db0f81	ITM-0019	VGA to HDMI Converter	3	\N	\N
fa77d16b-ba27-41d0-92ae-307788844f65	ITM-0020	Cat6 Patch Cable 1m	20	\N	\N
dbf0b9a1-36f7-4185-bde6-f757cc1cf363	ITM-0021	Wood Desk	1	\N	2025-12-10 12:51:08.963843+07
\.


--
-- Data for Name: opname_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.opname_number_counters (year, counter) FROM stdin;
2025	6
\.


--
-- Data for Name: order_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.order_number_counters (year, month, counter) FROM stdin;
2025	11	197
2025	12	6
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.purchase_order_items (id, purchase_order_id, item_id, qty, price, received_qty) FROM stdin;
72e93987-501a-4e66-8f4b-f59a79e6a3e8	cbce7619-9e94-4758-8ed7-2afdbd2fe967	e321c296-e580-4da3-89ba-99fe46477ae1	2	109103.18	0
217b9ba4-e284-495d-8369-ca66a7c88dfc	cbce7619-9e94-4758-8ed7-2afdbd2fe967	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	1	245984.26	0
c2c1c892-ef09-4b22-8e91-2c28b2f7862e	cbce7619-9e94-4758-8ed7-2afdbd2fe967	02540f95-d36f-4d7a-9eef-df9e84fe24ca	5	114312.35	0
7882ae6c-49f5-4aba-8830-ff19b14eccf7	02352e93-98bd-43f3-b19c-029dfe41490d	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	1	324498.03	0
4c9f0979-70e4-480b-85af-5f5c6c6782fd	02352e93-98bd-43f3-b19c-029dfe41490d	88eb8906-5332-456d-aa94-4aacedbf198f	4	366797.84	0
26597012-e0ba-4611-bb0a-d1597662811b	02352e93-98bd-43f3-b19c-029dfe41490d	db159f69-afbb-44bd-a04e-35880e5d408f	5	120698.88	0
f84c0521-c977-4172-bcc6-c6d14a1897e8	d97015fa-34b8-41b0-9a06-497859adb47c	02540f95-d36f-4d7a-9eef-df9e84fe24ca	2	227144.67	0
a349f485-6d45-46ae-bb52-9dca9557187c	d97015fa-34b8-41b0-9a06-497859adb47c	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	5	427929.34	0
80f4a3f1-9978-498d-9edf-eec86d790a53	d97015fa-34b8-41b0-9a06-497859adb47c	55843c0d-d32d-4024-897c-854069db0f81	2	408858.83	0
6b5dbd09-83ff-4835-915c-1191155df982	b3fc80a3-9530-42dd-a3ac-f0608d85b592	88eb8906-5332-456d-aa94-4aacedbf198f	3	282840.09	0
55a549e9-04c4-4544-a329-81e439a01013	b3fc80a3-9530-42dd-a3ac-f0608d85b592	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	3	546878.51	0
659ecb34-7942-418f-941d-cdac6186c631	b3fc80a3-9530-42dd-a3ac-f0608d85b592	fa77d16b-ba27-41d0-92ae-307788844f65	4	105368.83	0
5fd5f034-b6f2-4cad-88bb-37bb0e7a860d	f0215883-a3ea-4699-9795-a978a1319567	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	3	446905.06	0
0b2e77b7-8837-4ffb-bbad-90ce418f9f15	f0215883-a3ea-4699-9795-a978a1319567	807d0a7e-7446-4a11-baa5-5693abbd3c57	2	188832.32	0
0fd2afdb-3d98-4581-83d2-1080dfe7cf79	f0215883-a3ea-4699-9795-a978a1319567	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	3	230171.69	0
f98f3a6d-fdb0-4b2e-b0f7-d6e0b3b1c66f	f0215883-a3ea-4699-9795-a978a1319567	e15f9138-0b4f-4da6-b620-f3af2cc24df6	3	481135.44	0
dfe2d684-474b-465d-b15d-f505c9c4041c	bb49808e-bbd2-4f0e-9925-26955c54b5a3	e15f9138-0b4f-4da6-b620-f3af2cc24df6	4	145683.42	0
9b2d4c87-947b-48e3-a64b-b67ba735921f	bb49808e-bbd2-4f0e-9925-26955c54b5a3	a880bcc5-d001-4ed1-9378-33e5f71bf3df	5	517552.49	0
a83d5541-981a-4e0a-a76c-a0894d67eb13	bb49808e-bbd2-4f0e-9925-26955c54b5a3	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	5	598490.99	0
8e3efcb4-ca36-4b9d-a34b-7992f1ada4b1	bb49808e-bbd2-4f0e-9925-26955c54b5a3	d3c9af78-58bd-4649-a6da-19a07ae8844e	2	256102.87	0
b94c20c4-e9ba-4a02-aa22-89df2389a547	90bb2de9-205a-45d0-95ba-e6c1e0905ddd	db159f69-afbb-44bd-a04e-35880e5d408f	3	553285.41	0
05be1c55-9ce6-4e2c-94fd-633f7ee25736	90bb2de9-205a-45d0-95ba-e6c1e0905ddd	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	4	256407.41	0
30ab2ae0-80f5-46ae-9a7a-5a0c5e282dc9	90bb2de9-205a-45d0-95ba-e6c1e0905ddd	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	5	101841.99	0
e430fd72-da6a-4b58-b630-05d51aea80f8	90bb2de9-205a-45d0-95ba-e6c1e0905ddd	02540f95-d36f-4d7a-9eef-df9e84fe24ca	3	320761.61	0
7281ba8e-f6bd-448d-a9bf-5e4fbed3f96d	d836842a-7264-406d-a560-d949f8b59d95	db159f69-afbb-44bd-a04e-35880e5d408f	2	363952.87	0
52bdf029-b0d2-44b7-8bd5-145ba9d7bd5c	d836842a-7264-406d-a560-d949f8b59d95	88eb8906-5332-456d-aa94-4aacedbf198f	4	380792.57	0
57e3d5b6-aa1d-450f-b4f3-6fcdea8352e6	d836842a-7264-406d-a560-d949f8b59d95	a880bcc5-d001-4ed1-9378-33e5f71bf3df	1	582897.62	0
86961bdd-1624-4135-a4fa-43c250cfd4ce	d836842a-7264-406d-a560-d949f8b59d95	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	3	580181.76	0
34a8b811-d943-4ddf-889e-e4e1a2b92745	a893db83-1b12-44c8-9e50-0a33ff81e07f	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	5	147954.77	5
12f9f088-816a-40cb-b29e-023af08a7253	a893db83-1b12-44c8-9e50-0a33ff81e07f	02540f95-d36f-4d7a-9eef-df9e84fe24ca	4	159850.28	4
a3d55d46-9235-49c3-b86f-7df7371710ed	a893db83-1b12-44c8-9e50-0a33ff81e07f	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	1	433316.09	1
0cb98df9-8161-47ec-b6d9-43667268486f	074ee6c1-9ef1-48ac-ad5b-a6e1254fd140	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	2	474744.13	2
5d0fa0bd-e749-46a7-a8f0-bc9ba4e283f7	074ee6c1-9ef1-48ac-ad5b-a6e1254fd140	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	3	525790.90	3
36e90cc2-c008-425e-b35f-a67ffb204176	074ee6c1-9ef1-48ac-ad5b-a6e1254fd140	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	5	546142.04	5
6d4a343b-dcb1-4baa-9c48-5d57123b8049	8b1219d1-a992-45b8-a344-24353226c47b	a880bcc5-d001-4ed1-9378-33e5f71bf3df	2	389191.00	2
7f0aefed-4b0e-4b5e-a7b7-82b743d15a5c	8b1219d1-a992-45b8-a344-24353226c47b	fa77d16b-ba27-41d0-92ae-307788844f65	2	400747.96	2
82b40fb7-d3b1-4c37-8506-f4c996406643	8b1219d1-a992-45b8-a344-24353226c47b	55843c0d-d32d-4024-897c-854069db0f81	2	172438.70	2
352a6dae-0ce6-449e-b7f6-0d976b08b9d3	5f9d5cd5-4c17-4c86-aa07-95e5bc4ca9e9	a880bcc5-d001-4ed1-9378-33e5f71bf3df	1	398069.20	1
04191b13-dcb6-479c-bbb2-eee253554fe4	5f9d5cd5-4c17-4c86-aa07-95e5bc4ca9e9	db159f69-afbb-44bd-a04e-35880e5d408f	5	528677.02	5
60844eca-9ad7-4b62-beee-d0efec883451	5f9d5cd5-4c17-4c86-aa07-95e5bc4ca9e9	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	3	570135.78	3
0329a2d0-aabf-4ade-b33a-efa2b9675498	5f9d5cd5-4c17-4c86-aa07-95e5bc4ca9e9	e15f9138-0b4f-4da6-b620-f3af2cc24df6	1	333292.13	1
60959724-e178-4f20-a0f8-d531e20db817	a451f5d1-4b04-4f41-8fc3-510f138dd396	88eb8906-5332-456d-aa94-4aacedbf198f	2	112915.15	2
c172ce86-67b3-4f8d-bd2e-8dc6f03d3e3c	a451f5d1-4b04-4f41-8fc3-510f138dd396	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	5	156705.29	5
ad6ddd97-6494-47aa-a8f6-c6a2ebea733e	a451f5d1-4b04-4f41-8fc3-510f138dd396	807d0a7e-7446-4a11-baa5-5693abbd3c57	4	397011.35	4
21a7ab42-c300-4d13-beed-6fe6ee1d0e1b	a451f5d1-4b04-4f41-8fc3-510f138dd396	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	5	360957.32	5
36f960a4-a355-4c43-8252-8ec9eec6ee67	ceb846aa-559e-4652-919b-ba023a705e33	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	2	383118.46	2
82abad91-dc02-4dce-8b0a-faac4c62ed3f	ceb846aa-559e-4652-919b-ba023a705e33	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	1	308827.25	1
b1018f55-b401-47b7-87f6-165385c04189	ceb846aa-559e-4652-919b-ba023a705e33	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	3	283327.83	3
f180363c-7bae-4d93-a827-fff76db632a9	6fbf77f6-ddff-4658-93bf-f39ff3f787c9	02540f95-d36f-4d7a-9eef-df9e84fe24ca	5	442356.50	5
fea5d107-2495-4cbb-ad0b-a05892b67e27	6fbf77f6-ddff-4658-93bf-f39ff3f787c9	db159f69-afbb-44bd-a04e-35880e5d408f	2	359786.10	2
211dffee-f2d7-4ba3-9585-08ff46a088ff	6fbf77f6-ddff-4658-93bf-f39ff3f787c9	e321c296-e580-4da3-89ba-99fe46477ae1	1	392179.95	1
8e8951dc-c28c-4025-87bc-20bdb8c583dd	fa0b610c-9b83-4d8f-900d-0f80e31dfbb1	db159f69-afbb-44bd-a04e-35880e5d408f	5	375746.73	5
835a43ce-e9cb-41b5-8be7-55c877300312	fa0b610c-9b83-4d8f-900d-0f80e31dfbb1	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	2	115578.86	2
41a8b106-619e-4083-8e62-afc9b826f957	fa0b610c-9b83-4d8f-900d-0f80e31dfbb1	02540f95-d36f-4d7a-9eef-df9e84fe24ca	2	554136.43	2
bb42be37-debd-444c-9e40-21c5bab4bd6f	1d420abb-3208-4467-bdcf-e47f2dea581d	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	4	229492.84	2
280050c2-25a8-4516-8552-3ebd549e637f	1d420abb-3208-4467-bdcf-e47f2dea581d	55843c0d-d32d-4024-897c-854069db0f81	4	105803.13	2
4c2fe740-2ba9-4d91-8fc6-5a357a08f510	1e4370d8-5448-49d7-a3d5-2141919f09a0	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	1	498714.68	1
4d2069ca-137a-4c73-805b-64b2ec96b854	1e4370d8-5448-49d7-a3d5-2141919f09a0	0624daad-fbd5-4957-a2a8-ddbc54fba5f5	1	131855.88	1
45985eae-da3a-4584-95b6-afc0fa09f145	1e4370d8-5448-49d7-a3d5-2141919f09a0	e15f9138-0b4f-4da6-b620-f3af2cc24df6	4	322227.20	4
4bb742a7-7430-41c1-a2f3-5189286aa083	e9f5994e-af65-42ec-8271-746e1a8f88f6	db159f69-afbb-44bd-a04e-35880e5d408f	3	358179.69	3
838db72c-e13a-4604-8bf1-86401f36df3b	e9f5994e-af65-42ec-8271-746e1a8f88f6	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	3	577006.75	3
e335b891-6cf8-4e49-8c18-aca8b59a3a11	e9f5994e-af65-42ec-8271-746e1a8f88f6	fa77d16b-ba27-41d0-92ae-307788844f65	3	370505.42	3
3e4139a0-60c8-4a62-a75f-cea0f11a6702	4c97d2bb-4321-4206-8c5c-34c5cf220cbb	e321c296-e580-4da3-89ba-99fe46477ae1	4	293836.81	8
769bf971-fc5b-447a-aa86-7b042b18727b	4c97d2bb-4321-4206-8c5c-34c5cf220cbb	a880bcc5-d001-4ed1-9378-33e5f71bf3df	5	589481.87	10
22139502-74b7-4991-9888-61c60a863d0b	4c97d2bb-4321-4206-8c5c-34c5cf220cbb	d3c9af78-58bd-4649-a6da-19a07ae8844e	4	138601.57	8
91416ac1-c3f5-4371-b02f-726cd1f72579	67d635e7-f349-47f4-a881-7dfbec7f4d87	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	5	261217.42	5
be757155-26b7-455e-a63a-699d27c651bc	67d635e7-f349-47f4-a881-7dfbec7f4d87	d3c9af78-58bd-4649-a6da-19a07ae8844e	3	518575.26	3
5a983039-1f8d-461e-9e14-3a5a151074bb	67d635e7-f349-47f4-a881-7dfbec7f4d87	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	1	394462.70	1
648942ae-d4c2-4708-845a-ae5244fba11c	ceb3415b-2304-45c4-a461-9501554fd0ed	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	4	543825.17	4
73f56563-cdaa-498c-bda8-e942d8afed76	ceb3415b-2304-45c4-a461-9501554fd0ed	a880bcc5-d001-4ed1-9378-33e5f71bf3df	3	527469.87	3
31f2d977-3453-4309-ad68-8de7796f3ab7	ceb3415b-2304-45c4-a461-9501554fd0ed	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	3	195519.15	3
ecf7cb91-b907-4395-8c06-3bb528c0baff	8b8b55e0-a95b-4849-8879-5b5d5f81c16f	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	4	376538.22	2
85a3653e-5c61-4769-a9c1-d86216e39df7	8b8b55e0-a95b-4849-8879-5b5d5f81c16f	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	5	236383.73	2
2d1c180a-9f18-4911-9529-dadac1374ae7	8b8b55e0-a95b-4849-8879-5b5d5f81c16f	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	5	559573.01	2
e2cf964d-0145-4e1f-a449-cf9412d6ab5c	1d420abb-3208-4467-bdcf-e47f2dea581d	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	5	435792.20	4
161eca61-2040-4747-adc6-a73ab1a0a3f7	81418c45-7340-4f2f-bd4a-c2b83e416385	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	3	197789.11	3
ed990912-6a7d-4d19-857b-82027595a6ac	81418c45-7340-4f2f-bd4a-c2b83e416385	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	1	372388.75	1
839fdd26-2d13-4692-890b-b5c508895f92	81418c45-7340-4f2f-bd4a-c2b83e416385	55843c0d-d32d-4024-897c-854069db0f81	5	142814.82	5
607eb208-b98a-4786-aa7b-7a3180962833	81418c45-7340-4f2f-bd4a-c2b83e416385	db159f69-afbb-44bd-a04e-35880e5d408f	1	211469.76	1
76f71fb9-f4d9-4c50-974e-3dcdd3f3aed4	b4412d31-01c3-42f6-8890-73a901dd9645	db159f69-afbb-44bd-a04e-35880e5d408f	2	248425.24	2
26cba92d-5fee-498e-939f-8a2a2ac50b75	b4412d31-01c3-42f6-8890-73a901dd9645	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	3	304440.06	3
15080296-abf3-4e99-8d83-a2ce84ac5ea1	b4412d31-01c3-42f6-8890-73a901dd9645	e15f9138-0b4f-4da6-b620-f3af2cc24df6	3	350249.30	3
e545114d-c0f6-4de9-84a5-6d5e3a757660	7fc92b70-d956-44f7-a706-bfff6965d93e	e321c296-e580-4da3-89ba-99fe46477ae1	3	432457.17	3
f55ea047-9807-4723-982e-61689f6b0b38	7fc92b70-d956-44f7-a706-bfff6965d93e	fa77d16b-ba27-41d0-92ae-307788844f65	1	451771.56	1
4fc4287d-b66b-4b11-aac1-95df42120822	7fc92b70-d956-44f7-a706-bfff6965d93e	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	2	387127.57	2
7863d5d0-d815-484c-a5fd-b3c4df107ccc	a893db83-1b12-44c8-9e50-0a33ff81e07f	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	1	148571.71	1
631fd5da-933c-47f3-8bc3-6de9d57c9fe8	6a612f4a-e9c8-449c-82ad-b8decb7e0830	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	3	353659.69	3
4965ee16-efc2-4ccc-85f5-cab9e8cc2e56	6a612f4a-e9c8-449c-82ad-b8decb7e0830	db159f69-afbb-44bd-a04e-35880e5d408f	1	213314.77	1
bc74906c-4c01-49bc-9a32-e294749b28e4	6a612f4a-e9c8-449c-82ad-b8decb7e0830	88eb8906-5332-456d-aa94-4aacedbf198f	2	485972.01	2
db2de3df-5d8d-4310-a767-012707653896	6a612f4a-e9c8-449c-82ad-b8decb7e0830	a880bcc5-d001-4ed1-9378-33e5f71bf3df	5	274400.87	5
aef9090a-f15f-4e0e-9bf7-fa1334c31caf	ceb846aa-559e-4652-919b-ba023a705e33	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	2	499923.11	2
5399cff5-faa4-401a-bed1-98bef4cc966b	25bb99c4-a2a1-4aed-b3bf-35f570028ad0	88eb8906-5332-456d-aa94-4aacedbf198f	1	547051.82	1
7597694c-0167-4952-9a8b-f98ff9d3154b	25bb99c4-a2a1-4aed-b3bf-35f570028ad0	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	1	398909.53	1
367995b3-97bd-40cf-a841-9e5a54a1e6aa	25bb99c4-a2a1-4aed-b3bf-35f570028ad0	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	2	402743.69	2
7e4c4fdc-4aef-4c78-80ed-8f48f877a148	6a8c720f-1a33-48ae-b121-228455e2c84e	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	4	427500.20	4
51851d00-f3c9-468a-b711-f5777291544a	6a8c720f-1a33-48ae-b121-228455e2c84e	55843c0d-d32d-4024-897c-854069db0f81	1	235909.69	1
6da1d39c-9bbf-4e8d-93e3-1c3582b8d512	6a8c720f-1a33-48ae-b121-228455e2c84e	a880bcc5-d001-4ed1-9378-33e5f71bf3df	1	524496.25	1
46df19e5-543a-4c66-b95c-71c41089db4a	33eb39b5-5c4d-468b-bcdb-406caeca1be9	807d0a7e-7446-4a11-baa5-5693abbd3c57	5	372840.87	5
574d6949-bbe0-430c-8cd9-8976ff58a4f0	33eb39b5-5c4d-468b-bcdb-406caeca1be9	88eb8906-5332-456d-aa94-4aacedbf198f	2	172981.34	2
194f8e76-9448-40d5-87c2-9a30ef4f48d0	33eb39b5-5c4d-468b-bcdb-406caeca1be9	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	2	507499.89	2
4e0a5e0b-106f-4104-94d1-8db50c7e45db	de61859b-0b61-443a-ad3f-dd189aa4f94b	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	10	0.00	0
1d25aedc-1d28-4d30-927b-e303eab68d30	da9a0055-8acb-4678-8d8d-0918b93a2432	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	1	0.00	0
7746a4e1-8d2d-4e49-ad6b-a8624edd6332	efe1e8eb-11fc-44fc-91a7-1264b882f173	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	1	\N	0
4bbfff26-31c5-4631-a3b1-9b676c2bd575	178d24f7-6ce3-4308-bb07-bad06037ec7c	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	10	\N	20
375c2dea-3170-41dc-bb9d-7079c16f2600	178d24f7-6ce3-4308-bb07-bad06037ec7c	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	10	\N	20
189808af-dece-4dbb-a003-175714670e4b	178d24f7-6ce3-4308-bb07-bad06037ec7c	e15f9138-0b4f-4da6-b620-f3af2cc24df6	10	\N	10
2703516d-7e05-4a36-b074-2d61a07a1d31	0ead94e4-3b52-4bc3-a0ab-c8cc63dbeae7	55843c0d-d32d-4024-897c-854069db0f81	1	0.00	1
9c6cd3f6-5b19-4d73-b3a2-8f5f61bb2742	8b8b55e0-a95b-4849-8879-5b5d5f81c16f	db159f69-afbb-44bd-a04e-35880e5d408f	4	407937.14	2
3baf8883-f4f1-4409-a581-aad076dbb1df	9aa1d0a6-6631-4409-ae83-60176e7765fa	88eb8906-5332-456d-aa94-4aacedbf198f	10	\N	10
9bf84a6c-6784-4209-8f44-9f4b14a82e91	9aa1d0a6-6631-4409-ae83-60176e7765fa	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	10	\N	10
bf520f21-9acd-42a5-9457-c02ea3b4b783	9aa1d0a6-6631-4409-ae83-60176e7765fa	a880bcc5-d001-4ed1-9378-33e5f71bf3df	10	\N	10
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.purchase_orders (id, order_number, supplier_id, order_date, status, created_at, created_by, expected_date, approved_by, approved_at, deleted_at, updated_at, notes) FROM stdin;
cbce7619-9e94-4758-8ed7-2afdbd2fe967	PO-2025-11-0171	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	draft	2025-11-27 13:17:42.67569	\N	2025-11-28	\N	\N	\N	\N	General procurement batch 1
02352e93-98bd-43f3-b19c-029dfe41490d	PO-2025-11-0172	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	draft	2025-11-27 13:17:42.67569	\N	2025-11-28	\N	\N	\N	\N	General procurement batch 2
d97015fa-34b8-41b0-9a06-497859adb47c	PO-2025-11-0173	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	draft	2025-11-27 13:17:42.67569	\N	2025-11-28	\N	\N	\N	\N	Quarterly stock replenishment
b3fc80a3-9530-42dd-a3ac-f0608d85b592	PO-2025-11-0175	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	draft	2025-11-27 13:17:42.67569	\N	2025-11-28	\N	\N	\N	\N	Preparation for new branch
f0215883-a3ea-4699-9795-a978a1319567	PO-2025-11-0176	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	draft	2025-11-27 13:17:42.67569	\N	2025-11-28	\N	\N	\N	\N	Replenish frequently used items
bb49808e-bbd2-4f0e-9925-26955c54b5a3	PO-2025-11-0177	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	draft	2025-11-27 13:17:42.67569	\N	2025-11-28	\N	\N	\N	\N	Backup stock purchasing
074ee6c1-9ef1-48ac-ad5b-a6e1254fd140	PO-2025-11-0185	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:39.456+07	\N	\N	Replacement for damaged items
8b1219d1-a992-45b8-a344-24353226c47b	PO-2025-11-0186	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:35.421+07	\N	\N	Client project initial materials
de61859b-0b61-443a-ad3f-dd189aa4f94b	PO-2025-12-0001	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-12-03	draft	2025-12-03 17:34:51.844336	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-04	\N	\N	2025-12-03 17:36:17.010496+07	\N	
0ead94e4-3b52-4bc3-a0ab-c8cc63dbeae7	PO-2025-12-0003	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-12-08	received	2025-12-08 10:30:07.670947	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-09	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-11 10:39:43.583+07	\N	\N	IT Department's Request
1e4370d8-5448-49d7-a3d5-2141919f09a0	PO-2025-11-0168	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-08 10:04:16.811+07	\N	\N	Initial PO for restock
da9a0055-8acb-4678-8d8d-0918b93a2432	PO-2025-12-0002	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-12-08	cancelled	2025-12-08 10:29:08.588216	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-09	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-11 10:40:38.759+07	\N	\N	IT Departement's request
4c97d2bb-4321-4206-8c5c-34c5cf220cbb	PO-2025-11-0169	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-08 10:05:20.079+07	\N	\N	Urgent order for client project
e9f5994e-af65-42ec-8271-746e1a8f88f6	PO-2025-11-0179	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-08 10:09:00.542+07	\N	\N	Network device replenishment
67d635e7-f349-47f4-a881-7dfbec7f4d87	PO-2025-11-0170	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-08 10:18:55.126+07	\N	\N	Initial restock before deployment
8b8b55e0-a95b-4849-8879-5b5d5f81c16f	PO-2025-11-0174	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	cancelled	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-11 10:41:01+07	\N	\N	Supplier gave discount items
6a612f4a-e9c8-449c-82ad-b8decb7e0830	PO-2025-11-0195	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:51:53.097+07	\N	\N	Restock due to unexpected demand
5f9d5cd5-4c17-4c86-aa07-95e5bc4ca9e9	PO-2025-11-0187	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:31.164+07	\N	\N	Quarterly maintenance supplies
81418c45-7340-4f2f-bd4a-c2b83e416385	PO-2025-11-0197	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:51:39.619+07	\N	\N	General purchase round 3
b4412d31-01c3-42f6-8890-73a901dd9645	PO-2025-11-0196	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:51:49.044+07	\N	\N	Procurement for customer urgent job
7fc92b70-d956-44f7-a706-bfff6965d93e	PO-2025-11-0183	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:48.16+07	\N	\N	Restock before seasonal demand
a893db83-1b12-44c8-9e50-0a33ff81e07f	PO-2025-11-0184	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:43.826+07	\N	\N	Supplier promotion event purchase
a451f5d1-4b04-4f41-8fc3-510f138dd396	PO-2025-11-0188	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:26.763+07	\N	\N	Pre-order for upcoming deployment
ceb846aa-559e-4652-919b-ba023a705e33	PO-2025-11-0189	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:20.813+07	\N	\N	Restock commonly used components
6fbf77f6-ddff-4658-93bf-f39ff3f787c9	PO-2025-11-0190	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:15.88+07	\N	\N	Preparation for year-end operations
fa0b610c-9b83-4d8f-900d-0f80e31dfbb1	PO-2025-11-0191	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:10.967+07	\N	\N	Replacement for low-quality batch
25bb99c4-a2a1-4aed-b3bf-35f570028ad0	PO-2025-11-0192	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:05.232+07	\N	\N	Additional items requested by technician team
6a8c720f-1a33-48ae-b121-228455e2c84e	PO-2025-11-0193	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:52:01.357+07	\N	\N	Backup materials for remote sites
33eb39b5-5c4d-468b-bcdb-406caeca1be9	PO-2025-11-0194	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-11-27 15:51:57.529+07	\N	\N	Testing materials for new product line
ceb3415b-2304-45c4-a461-9501554fd0ed	PO-2025-11-0178	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	received	2025-11-27 13:17:42.67569	\N	2025-11-28	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-08 10:19:45.644+07	\N	\N	Spare parts procurement
d836842a-7264-406d-a560-d949f8b59d95	PO-2025-11-0182	fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	2025-11-27	cancelled	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-01 16:10:38.506+07	\N	\N	Urgent supply request
90bb2de9-205a-45d0-95ba-e6c1e0905ddd	PO-2025-11-0181	34de6448-2a85-4adb-b878-8aa2208c1466	2025-11-27	cancelled	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-01 16:11:10.95+07	\N	\N	Client request preparation
1d420abb-3208-4467-bdcf-e47f2dea581d	PO-2025-11-0180	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-11-27	confirmed	2025-11-27 13:17:42.67569	\N	2025-11-28	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-01 16:34:20.49+07	\N	\N	Consumable materials restock
efe1e8eb-11fc-44fc-91a7-1264b882f173	PO-2025-12-0005	368f9a28-0dca-4d02-add7-14cdabedf31c	2025-12-10	draft	2025-12-11 10:36:15.918617	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-12	\N	\N	2025-12-11 10:36:47.948302+07	2025-12-11 10:36:29.427933+07	New Network for office
178d24f7-6ce3-4308-bb07-bad06037ec7c	PO-2025-12-0004	368f9a28-0dca-4d02-add7-14cdabedf31c	2025-12-04	received	2025-12-10 13:56:54.165212	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-11	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-11 10:38:33.975+07	\N	2025-12-11 10:36:59.248499+07	New Office Setup
9aa1d0a6-6631-4409-ae83-60176e7765fa	PO-2025-12-0006	c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	2025-12-14	received	2025-12-17 14:53:42.205621	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-18	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-17 14:59:59.96+07	\N	2025-12-17 14:59:50.493672+07	
\.


--
-- Data for Name: purchase_receive_items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.purchase_receive_items (id, purchase_receive_id, item_id, qty) FROM stdin;
8f4fe3cb-d3b4-434c-9f9b-299693ecb9a9	67c9a8a8-1153-4832-9267-be3e14263943	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	3.00
a66b9885-7338-4b72-a15e-d5bd447bce93	67c9a8a8-1153-4832-9267-be3e14263943	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	1.00
13030993-f9ae-4c99-8fe8-f7c8f47f287b	67c9a8a8-1153-4832-9267-be3e14263943	55843c0d-d32d-4024-897c-854069db0f81	5.00
cea7cd05-a11b-47eb-9336-33cb9fd6c7a3	67c9a8a8-1153-4832-9267-be3e14263943	db159f69-afbb-44bd-a04e-35880e5d408f	1.00
530b4b72-b8a5-44d4-84d1-e720a58e89fa	a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	2.00
5fb2027a-07ca-4e09-bf36-152ce478d6ba	a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	e15f9138-0b4f-4da6-b620-f3af2cc24df6	2.00
c9b17a3f-1581-4ee3-bfa3-0fe3df29f8d0	a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	db159f69-afbb-44bd-a04e-35880e5d408f	2.00
b91df0d6-c85d-46d9-a383-42be71da5b7d	60c3682f-1b09-49e0-970a-ce446e0c562d	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	1.00
8b153cc6-c38e-4030-8533-35bfad735025	60c3682f-1b09-49e0-970a-ce446e0c562d	e15f9138-0b4f-4da6-b620-f3af2cc24df6	1.00
0c7faee4-6d9b-457c-96b7-14d67116aacb	53b8ed62-973a-4016-953e-28ee2af4e13b	e321c296-e580-4da3-89ba-99fe46477ae1	3.00
b30aee99-9508-4d53-ab1e-77ee309282d5	53b8ed62-973a-4016-953e-28ee2af4e13b	fa77d16b-ba27-41d0-92ae-307788844f65	1.00
e5fff60a-20a1-4140-a7de-6b243ad6e11b	53b8ed62-973a-4016-953e-28ee2af4e13b	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	2.00
62737f8f-91e9-4210-94f8-fe724a485137	acbf22c1-70db-4d9d-b826-a6cd8364130f	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	5.00
ce276b8d-ae01-4397-b5fd-3e7153ae745d	acbf22c1-70db-4d9d-b826-a6cd8364130f	02540f95-d36f-4d7a-9eef-df9e84fe24ca	4.00
121f26a8-6872-49d0-bb09-6be7ce26b3f5	acbf22c1-70db-4d9d-b826-a6cd8364130f	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	1.00
cafbb5cc-1ca3-4bb2-8b68-0a4852ed3648	acbf22c1-70db-4d9d-b826-a6cd8364130f	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	1.00
e56bcc17-a976-4819-bf43-a213bf0f1965	1f03f860-7370-4f6c-aa72-d3ea102752d5	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	2.00
4860182c-01da-4257-9921-adb83c749d7e	1f03f860-7370-4f6c-aa72-d3ea102752d5	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	3.00
f9e35bf3-1380-42e6-b5cb-800e1233dc4b	1f03f860-7370-4f6c-aa72-d3ea102752d5	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	5.00
f886ba9b-e32d-4347-af4f-88759d305348	bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	a880bcc5-d001-4ed1-9378-33e5f71bf3df	2.00
2264cd05-8faa-4efc-a425-1683f5e22b77	bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	fa77d16b-ba27-41d0-92ae-307788844f65	2.00
b27d3eea-66ad-4a67-baf2-6bea921bd5b5	bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	55843c0d-d32d-4024-897c-854069db0f81	2.00
4776844e-f953-4bf6-85ca-c8b02c0b0855	d04de5c9-a8cd-4ccd-9500-c751d64490d7	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	3.00
3b67b76f-ad0a-4400-8def-cbe562e13634	d04de5c9-a8cd-4ccd-9500-c751d64490d7	db159f69-afbb-44bd-a04e-35880e5d408f	1.00
a7181df6-9027-49ef-8f2a-a24c6c4b5ee3	d04de5c9-a8cd-4ccd-9500-c751d64490d7	88eb8906-5332-456d-aa94-4aacedbf198f	2.00
0d4800e8-9c6f-4e64-848c-656c0c52742d	d04de5c9-a8cd-4ccd-9500-c751d64490d7	a880bcc5-d001-4ed1-9378-33e5f71bf3df	5.00
7cc76ca1-56b8-45ba-9dfc-b986eb2e4ddd	98748981-3216-40ea-a285-affcff6d826e	a880bcc5-d001-4ed1-9378-33e5f71bf3df	1.00
90e73823-0df2-4738-a7e8-a22d8712c8eb	98748981-3216-40ea-a285-affcff6d826e	db159f69-afbb-44bd-a04e-35880e5d408f	5.00
eda8a215-a145-4b44-8f5e-7fd3ee475b53	98748981-3216-40ea-a285-affcff6d826e	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	3.00
ebf0ecbd-7843-4d6b-801b-9508cf33a132	98748981-3216-40ea-a285-affcff6d826e	e15f9138-0b4f-4da6-b620-f3af2cc24df6	1.00
994b162a-da05-4075-86b9-e09e6350abd4	72651f05-322d-4c08-aed7-4b8d84052e0a	88eb8906-5332-456d-aa94-4aacedbf198f	2.00
d1b5f09d-1479-40ae-8627-c8e8ab89e741	72651f05-322d-4c08-aed7-4b8d84052e0a	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	5.00
b091c22a-a44b-44a3-8db2-f3dd68760831	72651f05-322d-4c08-aed7-4b8d84052e0a	807d0a7e-7446-4a11-baa5-5693abbd3c57	4.00
603ae14d-af89-4358-8f94-88a8994d0444	72651f05-322d-4c08-aed7-4b8d84052e0a	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	5.00
029665c2-ff76-40be-89d7-31463129cc12	2165e74f-59cb-4ddd-9425-1f313f42bcdc	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	2.00
73d5b902-3917-48ce-8a1e-e87ca1e48857	2165e74f-59cb-4ddd-9425-1f313f42bcdc	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	1.00
8155696b-bcc3-4d47-b167-7bb3f35f14c1	2165e74f-59cb-4ddd-9425-1f313f42bcdc	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	3.00
904a709e-9f7e-4701-bbed-ea5c6f89ce2f	2165e74f-59cb-4ddd-9425-1f313f42bcdc	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	2.00
12f5a18f-e926-4e41-ae44-d8cea27725c5	f539bada-5d9c-49b5-b298-5d0ab8fc3d99	02540f95-d36f-4d7a-9eef-df9e84fe24ca	5.00
8b86a659-a81e-4476-9286-ee656d42fd57	f539bada-5d9c-49b5-b298-5d0ab8fc3d99	db159f69-afbb-44bd-a04e-35880e5d408f	2.00
644dfb39-aa8c-4c9d-8870-8fee909b7114	f539bada-5d9c-49b5-b298-5d0ab8fc3d99	e321c296-e580-4da3-89ba-99fe46477ae1	1.00
f31526f9-4a4f-4567-8852-b69e91d806d3	039f7851-a280-4178-b8e1-814c7faa8b6a	db159f69-afbb-44bd-a04e-35880e5d408f	5.00
0ae634cb-4d16-4c61-ada8-1ebcf7de9ed8	039f7851-a280-4178-b8e1-814c7faa8b6a	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	2.00
c6991357-5859-4cc9-a73b-15fce7aaf14b	039f7851-a280-4178-b8e1-814c7faa8b6a	02540f95-d36f-4d7a-9eef-df9e84fe24ca	2.00
bcd0aea1-f6f6-4a90-9f3a-aeafde92541b	a9df3903-1ac1-4929-b917-f41134cc8ff6	88eb8906-5332-456d-aa94-4aacedbf198f	1.00
077c750a-493d-4879-a254-a85ef80ed71a	a9df3903-1ac1-4929-b917-f41134cc8ff6	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	1.00
37048b3d-ef0c-420c-94a8-3c2f3c52165a	a9df3903-1ac1-4929-b917-f41134cc8ff6	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	2.00
67f381a9-17f2-4074-8bf5-ba78993960c2	c7fbdde9-31d3-41ba-a235-c204a7a75643	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	4.00
7ecee3aa-a4ee-46d7-9d3a-a9d1ffa01f9c	c7fbdde9-31d3-41ba-a235-c204a7a75643	55843c0d-d32d-4024-897c-854069db0f81	1.00
9e7131e9-4e0a-427d-bb29-885507fc9b58	c7fbdde9-31d3-41ba-a235-c204a7a75643	a880bcc5-d001-4ed1-9378-33e5f71bf3df	1.00
fa5a68a6-08dd-4d52-b877-6e444baa6e2d	64aed723-5881-4a0e-8fea-9248f1d7a252	807d0a7e-7446-4a11-baa5-5693abbd3c57	5.00
472f4877-3036-459e-8d00-6b4bf907b278	64aed723-5881-4a0e-8fea-9248f1d7a252	88eb8906-5332-456d-aa94-4aacedbf198f	2.00
6cf14981-84fd-4160-b49d-f72d12965e80	64aed723-5881-4a0e-8fea-9248f1d7a252	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	2.00
b2de4317-5e74-4a2f-bfdc-a1a1e52f9e69	d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	2.00
06e2cab8-360e-4779-aab8-94289cde14d9	d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	2.00
ead9e692-06b8-47b8-ab87-9738ffbc924a	d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	55843c0d-d32d-4024-897c-854069db0f81	2.00
f051ab33-35e0-42f2-9a3a-3df21dde4b5e	dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	1.00
15bf8929-99a8-494e-a207-14759ab56513	dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	0624daad-fbd5-4957-a2a8-ddbc54fba5f5	1.00
21bce861-4fca-456f-a642-de5930095f77	dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	e15f9138-0b4f-4da6-b620-f3af2cc24df6	4.00
def07f67-7c37-4673-8c9c-c2e67e6dd612	a6db83c5-32e3-4c2d-892b-b64047b8b5db	e321c296-e580-4da3-89ba-99fe46477ae1	4.00
f6d83f47-ec06-4275-b9e1-25bf2297a7aa	a6db83c5-32e3-4c2d-892b-b64047b8b5db	a880bcc5-d001-4ed1-9378-33e5f71bf3df	5.00
c9e7daf1-32ae-486e-b64f-5cd5ef165f4d	a6db83c5-32e3-4c2d-892b-b64047b8b5db	d3c9af78-58bd-4649-a6da-19a07ae8844e	4.00
cde610d4-5996-4068-953d-a072e3a8d5c5	ed068947-beb6-4906-b2e1-d72d8fb5fc4f	e321c296-e580-4da3-89ba-99fe46477ae1	4.00
2da40afa-c014-4cc7-9657-e9b973bd3a35	ed068947-beb6-4906-b2e1-d72d8fb5fc4f	a880bcc5-d001-4ed1-9378-33e5f71bf3df	5.00
5c1e6d5f-5b3e-4181-8bb3-709dab604b7e	ed068947-beb6-4906-b2e1-d72d8fb5fc4f	d3c9af78-58bd-4649-a6da-19a07ae8844e	4.00
685c3217-ecc2-415c-936e-269075d55386	ec0fcf47-b733-43d3-a36f-390806ac7b78	db159f69-afbb-44bd-a04e-35880e5d408f	3.00
ee473cc4-febc-4f7c-8d6f-57a1ffc09a63	ec0fcf47-b733-43d3-a36f-390806ac7b78	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	3.00
6fc3c14e-827e-4a7c-8502-020472e35b51	ec0fcf47-b733-43d3-a36f-390806ac7b78	fa77d16b-ba27-41d0-92ae-307788844f65	3.00
3a675bad-80e4-43c1-b64c-bb8d639be899	c83c5729-2a64-4c23-bcb3-f30769320754	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	5.00
ff7b6fb6-edf4-43b3-b43b-e3613e0a692d	c83c5729-2a64-4c23-bcb3-f30769320754	d3c9af78-58bd-4649-a6da-19a07ae8844e	3.00
7e921429-b70b-4c00-8201-a9f4a1e468be	c83c5729-2a64-4c23-bcb3-f30769320754	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	1.00
6747dcf1-baf1-4c4e-9094-4c0df135b97c	ec89f36f-cd37-432b-8b4d-a7a44aca91f9	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	4.00
f1712595-abb8-4542-9758-a254c01c1cf4	ec89f36f-cd37-432b-8b4d-a7a44aca91f9	a880bcc5-d001-4ed1-9378-33e5f71bf3df	3.00
ad6b614c-4763-46c6-ab7b-40a5427145bc	ec89f36f-cd37-432b-8b4d-a7a44aca91f9	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	3.00
a16f985a-b448-4a25-a4f5-9af7b7e7ff1b	52cb2086-76b7-40e5-819c-2dc8ef77b1c2	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	10.00
2db6736b-e055-4298-b8be-8bec79e81655	52cb2086-76b7-40e5-819c-2dc8ef77b1c2	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	10.00
cc52293a-1674-4cea-9061-01f2903a0fe5	52cb2086-76b7-40e5-819c-2dc8ef77b1c2	e15f9138-0b4f-4da6-b620-f3af2cc24df6	10.00
1275f41d-fcf4-4e73-9683-b7df4ba42154	c7b869c5-76a5-48bf-973a-abddd5438ef3	55843c0d-d32d-4024-897c-854069db0f81	1.00
71117041-d4ff-4735-bc9d-ca971392cd64	c52e42ce-61cf-4ca6-83de-9d39b3324b94	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	2.00
f9b73241-4254-4d0d-8869-138427ed683f	c52e42ce-61cf-4ca6-83de-9d39b3324b94	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	2.00
d7bc6dc5-ca0e-4530-83d1-bc1c6a0db8a8	c52e42ce-61cf-4ca6-83de-9d39b3324b94	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	2.00
44c4daf2-8cd5-4e6f-9ee7-6ad5f2e0d9d5	c52e42ce-61cf-4ca6-83de-9d39b3324b94	db159f69-afbb-44bd-a04e-35880e5d408f	2.00
e81acc95-11e9-459e-af7a-d293b5b0fc74	d482c60f-a043-4683-b662-0aad47a31575	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	2.00
a55ce93a-6ec0-4c9d-a500-05fc734698d7	55436c9d-09fb-4bcf-93fa-c75da5112115	88eb8906-5332-456d-aa94-4aacedbf198f	10.00
67e732c0-d35f-45ab-8cf5-8ee9cfb0b2a9	55436c9d-09fb-4bcf-93fa-c75da5112115	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	10.00
5a65d824-f4a5-4c6e-990c-e33f14788982	55436c9d-09fb-4bcf-93fa-c75da5112115	a880bcc5-d001-4ed1-9378-33e5f71bf3df	10.00
\.


--
-- Data for Name: purchase_receives; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.purchase_receives (id, purchase_order_id, receive_date, received_by, note, created_at, location_id) FROM stdin;
67c9a8a8-1153-4832-9267-be3e14263943	81418c45-7340-4f2f-bd4a-c2b83e416385	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 12:09:19.929846	4f1c5549-89d7-4335-981e-d042996c550f
a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	b4412d31-01c3-42f6-8890-73a901dd9645	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c	Partially received	2025-12-01 13:53:08.865309	4f1c5549-89d7-4335-981e-d042996c550f
60c3682f-1b09-49e0-970a-ce446e0c562d	b4412d31-01c3-42f6-8890-73a901dd9645	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c	Bad Received Item	2025-12-01 13:57:10.991119	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
53b8ed62-973a-4016-953e-28ee2af4e13b	7fc92b70-d956-44f7-a706-bfff6965d93e	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:02:08.452692	4f1c5549-89d7-4335-981e-d042996c550f
acbf22c1-70db-4d9d-b826-a6cd8364130f	a893db83-1b12-44c8-9e50-0a33ff81e07f	2025-12-03	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:02:33.892274	4f1c5549-89d7-4335-981e-d042996c550f
1f03f860-7370-4f6c-aa72-d3ea102752d5	074ee6c1-9ef1-48ac-ad5b-a6e1254fd140	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:05:05.772063	4f1c5549-89d7-4335-981e-d042996c550f
bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	8b1219d1-a992-45b8-a344-24353226c47b	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:05:32.111171	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
d04de5c9-a8cd-4ccd-9500-c751d64490d7	6a612f4a-e9c8-449c-82ad-b8decb7e0830	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:05:57.371647	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
98748981-3216-40ea-a285-affcff6d826e	5f9d5cd5-4c17-4c86-aa07-95e5bc4ca9e9	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:06:19.083412	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
72651f05-322d-4c08-aed7-4b8d84052e0a	a451f5d1-4b04-4f41-8fc3-510f138dd396	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:06:46.698845	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
2165e74f-59cb-4ddd-9425-1f313f42bcdc	ceb846aa-559e-4652-919b-ba023a705e33	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:07:03.796351	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
f539bada-5d9c-49b5-b298-5d0ab8fc3d99	6fbf77f6-ddff-4658-93bf-f39ff3f787c9	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:07:19.294579	4f1c5549-89d7-4335-981e-d042996c550f
039f7851-a280-4178-b8e1-814c7faa8b6a	fa0b610c-9b83-4d8f-900d-0f80e31dfbb1	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:07:34.430984	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
a9df3903-1ac1-4929-b917-f41134cc8ff6	25bb99c4-a2a1-4aed-b3bf-35f570028ad0	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:07:47.934772	4f1c5549-89d7-4335-981e-d042996c550f
c7fbdde9-31d3-41ba-a235-c204a7a75643	6a8c720f-1a33-48ae-b121-228455e2c84e	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:08:01.496753	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
64aed723-5881-4a0e-8fea-9248f1d7a252	33eb39b5-5c4d-468b-bcdb-406caeca1be9	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:08:18.42771	4f1c5549-89d7-4335-981e-d042996c550f
d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	1d420abb-3208-4467-bdcf-e47f2dea581d	2025-12-01	a13f2ee7-a32c-433d-88c6-d463803dfd8c		2025-12-01 16:34:47.771226	4f1c5549-89d7-4335-981e-d042996c550f
dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	1e4370d8-5448-49d7-a3d5-2141919f09a0	2025-12-08	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	inspect inbound inventory	2025-12-08 10:05:00.124778	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
a6db83c5-32e3-4c2d-892b-b64047b8b5db	4c97d2bb-4321-4206-8c5c-34c5cf220cbb	2025-12-08	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	inspect inbound	2025-12-08 10:05:43.78558	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
ed068947-beb6-4906-b2e1-d72d8fb5fc4f	4c97d2bb-4321-4206-8c5c-34c5cf220cbb	2025-12-08	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	inspect inbound	2025-12-08 10:05:49.074882	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
ec0fcf47-b733-43d3-a36f-390806ac7b78	e9f5994e-af65-42ec-8271-746e1a8f88f6	2025-12-08	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	inspect	2025-12-08 10:09:32.158476	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
c83c5729-2a64-4c23-bcb3-f30769320754	67d635e7-f349-47f4-a881-7dfbec7f4d87	2025-12-08	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	inbound item received in good condition	2025-12-08 10:19:24.765298	4f1c5549-89d7-4335-981e-d042996c550f
ec89f36f-cd37-432b-8b4d-a7a44aca91f9	ceb3415b-2304-45c4-a461-9501554fd0ed	2025-12-08	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	prepared for installation	2025-12-08 10:22:05.872776	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
52cb2086-76b7-40e5-819c-2dc8ef77b1c2	178d24f7-6ce3-4308-bb07-bad06037ec7c	2025-12-11	566f6344-474a-43b5-a400-dfde48a6d0e3		2025-12-11 10:39:04.169323	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
c7b869c5-76a5-48bf-973a-abddd5438ef3	0ead94e4-3b52-4bc3-a0ab-c8cc63dbeae7	2025-12-11	566f6344-474a-43b5-a400-dfde48a6d0e3		2025-12-11 10:40:12.584841	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
c52e42ce-61cf-4ca6-83de-9d39b3324b94	8b8b55e0-a95b-4849-8879-5b5d5f81c16f	2025-12-11	566f6344-474a-43b5-a400-dfde48a6d0e3	The supplier can only supply part of the demand because the stock at the supplier is insufficient.	2025-12-11 10:54:20.435712	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
d482c60f-a043-4683-b662-0aad47a31575	1d420abb-3208-4467-bdcf-e47f2dea581d	2025-12-11	566f6344-474a-43b5-a400-dfde48a6d0e3	new batch received	2025-12-11 13:16:01.233793	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
55436c9d-09fb-4bcf-93fa-c75da5112115	9aa1d0a6-6631-4409-ae83-60176e7765fa	2025-12-17	566f6344-474a-43b5-a400-dfde48a6d0e3		2025-12-17 15:00:37.724313	4f1c5549-89d7-4335-981e-d042996c550f
\.


--
-- Data for Name: receipt_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.receipt_number_counters (year, month, counter) FROM stdin;
2025	12	8
\.


--
-- Data for Name: stock_adjustment_items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_adjustment_items (id, adjustment_id, item_id, location_id, quantity_diff, notes, quantity_before) FROM stdin;
776ae5b4-bfa8-46be-8c78-52bb4e4eae05	a022656b-3c73-4514-a6ec-3cfb5141b51f	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	4f1c5549-89d7-4335-981e-d042996c550f	1.00	Cancel Installation	4.00
53bc5955-a5ef-4574-a1b6-5ea3a9bed26c	a022656b-3c73-4514-a6ec-3cfb5141b51f	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	4f1c5549-89d7-4335-981e-d042996c550f	1.00	Cancel Installation	8.00
776dd45a-f1d3-48de-90a8-529c8634e81e	f5bb4fab-86c5-463d-bad5-c8fe2006d4c4	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	-1.00	Missing	8.00
72639e2c-2dc5-44e6-8fec-9a174305d744	b780eb24-ca6d-4e72-b75a-3fc34957ec8d	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	4f1c5549-89d7-4335-981e-d042996c550f	2.00	missing	3.00
b629f641-4658-4dc3-947c-9e75f56f000d	cc38e709-5a7a-45eb-aea7-be2e7999b303	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	-1.00	broken	3.00
495be333-b9be-4e43-a935-686a83d5e38b	cc38e709-5a7a-45eb-aea7-be2e7999b303	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	-1.00	broken	5.00
338b150b-0a49-45ed-b3c6-30c3dd86d5d7	8e842ec0-99b0-4408-a5b1-2118b1c5a633	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	1.00	fixed	2.00
2984f2e5-bdb7-42c3-ba32-75313b269d5f	8e842ec0-99b0-4408-a5b1-2118b1c5a633	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	1.00	fixed	4.00
0edb0b00-cce1-4a28-beab-b5015f07a411	8e842ec0-99b0-4408-a5b1-2118b1c5a633	e15f9138-0b4f-4da6-b620-f3af2cc24df6	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	-1.00	broken	13.00
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_adjustments (id, adjustment_number, adjustment_date, reason, status, created_by, created_at, updated_at, deleted_at) FROM stdin;
a022656b-3c73-4514-a6ec-3cfb5141b51f	ADJ-2025-12-0001	2025-12-04	Cancel Installation	confirmed	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-04 10:43:03.344876	2025-12-04 10:58:48.731058	\N
f5bb4fab-86c5-463d-bad5-c8fe2006d4c4	ADJ-2025-12-0002	2025-12-04	Inventory Missing	cancelled	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-04 10:44:11.622446	2025-12-04 10:59:12.387569	\N
b780eb24-ca6d-4e72-b75a-3fc34957ec8d	ADJ-2025-12-0003	2025-12-08	Adjustment missing inventory	confirmed	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	2025-12-08 15:25:27.893654	2025-12-08 15:25:51.836162	\N
cc38e709-5a7a-45eb-aea7-be2e7999b303	ADJ-2025-12-0004	2025-12-16	broken	confirmed	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-16 11:04:40.742052	2025-12-16 11:04:58.369778	\N
8e842ec0-99b0-4408-a5b1-2118b1c5a633	ADJ-2025-12-0005	2025-12-16	fix	confirmed	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-16 11:21:38.672934	2025-12-16 11:21:53.09724	\N
\.


--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_balances (item_id, location_id, qty) FROM stdin;
e15f9138-0b4f-4da6-b620-f3af2cc24df6	4f1c5549-89d7-4335-981e-d042996c550f	2
d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	1
e15f9138-0b4f-4da6-b620-f3af2cc24df6	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	13
88eb8906-5332-456d-aa94-4aacedbf198f	4f1c5549-89d7-4335-981e-d042996c550f	13
25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	4f1c5549-89d7-4335-981e-d042996c550f	15
a880bcc5-d001-4ed1-9378-33e5f71bf3df	4f1c5549-89d7-4335-981e-d042996c550f	10
3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	4f1c5549-89d7-4335-981e-d042996c550f	7
fa77d16b-ba27-41d0-92ae-307788844f65	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	2
e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	3
e15f9138-0b4f-4da6-b620-f3af2cc24df6	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	1
88eb8906-5332-456d-aa94-4aacedbf198f	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	4
807d0a7e-7446-4a11-baa5-5693abbd3c57	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	4
25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	5
64bf77fb-feba-4e4c-aa73-b323b62a0bc7	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	2
3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	3
1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	2
02540f95-d36f-4d7a-9eef-df9e84fe24ca	4f1c5549-89d7-4335-981e-d042996c550f	9
db159f69-afbb-44bd-a04e-35880e5d408f	4f1c5549-89d7-4335-981e-d042996c550f	5
e321c296-e580-4da3-89ba-99fe46477ae1	4f1c5549-89d7-4335-981e-d042996c550f	4
3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	2
02540f95-d36f-4d7a-9eef-df9e84fe24ca	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	2
8c830d37-6be1-4a54-9e8b-d9fcdfafad16	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	8
55843c0d-d32d-4024-897c-854069db0f81	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	3
a880bcc5-d001-4ed1-9378-33e5f71bf3df	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	9
55843c0d-d32d-4024-897c-854069db0f81	4f1c5549-89d7-4335-981e-d042996c550f	7
807d0a7e-7446-4a11-baa5-5693abbd3c57	4f1c5549-89d7-4335-981e-d042996c550f	15
fa77d16b-ba27-41d0-92ae-307788844f65	4f1c5549-89d7-4335-981e-d042996c550f	0
1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	4f1c5549-89d7-4335-981e-d042996c550f	6
d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	4f1c5549-89d7-4335-981e-d042996c550f	5
db159f69-afbb-44bd-a04e-35880e5d408f	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	5
ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	1
e15f9138-0b4f-4da6-b620-f3af2cc24df6	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	5
e321c296-e580-4da3-89ba-99fe46477ae1	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	8
d3c9af78-58bd-4649-a6da-19a07ae8844e	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	8
db159f69-afbb-44bd-a04e-35880e5d408f	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	8
ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	4f1c5549-89d7-4335-981e-d042996c550f	5
d3c9af78-58bd-4649-a6da-19a07ae8844e	4f1c5549-89d7-4335-981e-d042996c550f	3
e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	4
a880bcc5-d001-4ed1-9378-33e5f71bf3df	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	13
55843c0d-d32d-4024-897c-854069db0f81	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	1
fa77d16b-ba27-41d0-92ae-307788844f65	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	5
7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	4f1c5549-89d7-4335-981e-d042996c550f	8
8c830d37-6be1-4a54-9e8b-d9fcdfafad16	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	0
e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	4f1c5549-89d7-4335-981e-d042996c550f	5
1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	20
55843c0d-d32d-4024-897c-854069db0f81	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	1
7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	2
25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	2
3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	2
7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	2
d3c9af78-58bd-4649-a6da-19a07ae8844e	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	5
db159f69-afbb-44bd-a04e-35880e5d408f	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	4
1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	5
64bf77fb-feba-4e4c-aa73-b323b62a0bc7	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	1
0624daad-fbd5-4957-a2a8-ddbc54fba5f5	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	0
64bf77fb-feba-4e4c-aa73-b323b62a0bc7	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	3
ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	5
\.


--
-- Data for Name: stock_locations; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_locations (id, code, name, description, created_at, updated_at, deleted_at) FROM stdin;
4f1c5549-89d7-4335-981e-d042996c550f	MW	Warehouse	Primary central storage	2025-11-27 10:43:12.889574+07	2025-12-01 16:43:33.549459+07	\N
9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	ITM	Maintenance	Location for damaged inventory	2025-11-27 10:43:12.889574+07	2025-12-07 10:55:49.292774+07	\N
66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	FO	Front Offfice	Front Office	2025-12-10 12:49:54.275996+07	2025-12-10 12:49:54.275996+07	\N
821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	BO	Back Office	Back Office	2025-11-27 10:43:12.889574+07	2025-12-10 12:50:13.661813+07	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_movements (id, item_id, movement_type, adjustment_direction, qty, balance_after, reference_id, reference_type, note, created_at, created_by, source_location_id, target_location_id) FROM stdin;
b0f6c01a-3f14-40ff-ac39-3f3ff3ab1a84	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	inbound	increase	3	3	67c9a8a8-1153-4832-9267-be3e14263943	purchase_receive	Receive PO PO-2025-11-0197	2025-12-01 12:09:19.929846	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
5ca9abdc-b102-476d-bf06-8d4e9bd598b9	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	1	1	67c9a8a8-1153-4832-9267-be3e14263943	purchase_receive	Receive PO PO-2025-11-0197	2025-12-01 12:09:19.929846	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
8c0fe00b-6663-4d18-8efd-58ac5ee7fa8d	55843c0d-d32d-4024-897c-854069db0f81	inbound	increase	5	5	67c9a8a8-1153-4832-9267-be3e14263943	purchase_receive	Receive PO PO-2025-11-0197	2025-12-01 12:09:19.929846	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
66916157-dabb-4dd2-a3dd-3580a2814b14	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	1	1	67c9a8a8-1153-4832-9267-be3e14263943	purchase_receive	Receive PO PO-2025-11-0197	2025-12-01 12:09:19.929846	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
afacc029-3542-4db1-9b55-c26ecd083169	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	inbound	increase	2	2	a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	purchase_receive	Receive PO PO-2025-11-0196	2025-12-01 13:53:08.865309	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
41304db6-f339-4f6e-811a-a09c642e384a	e15f9138-0b4f-4da6-b620-f3af2cc24df6	inbound	increase	2	2	a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	purchase_receive	Receive PO PO-2025-11-0196	2025-12-01 13:53:08.865309	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
00fbfe4c-dcd9-4f0b-935b-25549e312713	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	2	3	a81cf3c9-01d6-4180-a7b0-2c5bc22ed3ac	purchase_receive	Receive PO PO-2025-11-0196	2025-12-01 13:53:08.865309	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
f97cb9fa-dc81-46fb-be0f-9b7222037f17	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	inbound	increase	1	1	60c3682f-1b09-49e0-970a-ce446e0c562d	purchase_receive	Receive PO PO-2025-11-0196	2025-12-01 13:57:10.991119	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
a778c58d-4b65-4252-aaa4-dd60b50cb09f	e15f9138-0b4f-4da6-b620-f3af2cc24df6	inbound	increase	1	1	60c3682f-1b09-49e0-970a-ce446e0c562d	purchase_receive	Receive PO PO-2025-11-0196	2025-12-01 13:57:10.991119	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
72b081b8-8715-4856-b45f-f091318bfd5a	e321c296-e580-4da3-89ba-99fe46477ae1	inbound	increase	3	3	53b8ed62-973a-4016-953e-28ee2af4e13b	purchase_receive	Receive PO PO-2025-11-0183	2025-12-01 16:02:08.452692	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
4e3190da-eb65-42e4-979f-02b38654d41f	fa77d16b-ba27-41d0-92ae-307788844f65	inbound	increase	1	1	53b8ed62-973a-4016-953e-28ee2af4e13b	purchase_receive	Receive PO PO-2025-11-0183	2025-12-01 16:02:08.452692	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
fe6a759e-8947-46be-9271-168d81e3267e	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	inbound	increase	2	2	53b8ed62-973a-4016-953e-28ee2af4e13b	purchase_receive	Receive PO PO-2025-11-0183	2025-12-01 16:02:08.452692	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
5c83d0f7-7154-475c-9883-5d7b3163fdaa	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	5	6	acbf22c1-70db-4d9d-b826-a6cd8364130f	purchase_receive	Receive PO PO-2025-11-0184	2025-12-01 16:02:33.892274	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
ba230104-c28d-4687-be61-8c91f6e5d91b	02540f95-d36f-4d7a-9eef-df9e84fe24ca	inbound	increase	4	4	acbf22c1-70db-4d9d-b826-a6cd8364130f	purchase_receive	Receive PO PO-2025-11-0184	2025-12-01 16:02:33.892274	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
d3aecad3-a26a-40ee-89a9-c82bb1e31c41	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	inbound	increase	1	4	acbf22c1-70db-4d9d-b826-a6cd8364130f	purchase_receive	Receive PO PO-2025-11-0184	2025-12-01 16:02:33.892274	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
d4baac53-fa8a-451e-b9c6-6f262be820c8	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	inbound	increase	1	1	acbf22c1-70db-4d9d-b826-a6cd8364130f	purchase_receive	Receive PO PO-2025-11-0184	2025-12-01 16:02:33.892274	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
5e036b3f-9875-4fae-8f6a-7934fcd06e07	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	inbound	increase	2	4	1f03f860-7370-4f6c-aa72-d3ea102752d5	purchase_receive	Receive PO PO-2025-11-0185	2025-12-01 16:05:05.772063	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
cbce403c-a815-4bfa-bc97-98fb1feb197f	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	inbound	increase	3	7	1f03f860-7370-4f6c-aa72-d3ea102752d5	purchase_receive	Receive PO PO-2025-11-0185	2025-12-01 16:05:05.772063	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
f2f90860-5cb7-4714-abd8-e59281ba6751	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	inbound	increase	5	7	1f03f860-7370-4f6c-aa72-d3ea102752d5	purchase_receive	Receive PO PO-2025-11-0185	2025-12-01 16:05:05.772063	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
2198d0f5-0ce2-40f9-a733-9939d89c1707	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	2	2	bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	purchase_receive	Receive PO PO-2025-11-0186	2025-12-01 16:05:32.111171	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
5b0f2831-412a-4d9a-8acd-111a95d5bc54	fa77d16b-ba27-41d0-92ae-307788844f65	inbound	increase	2	2	bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	purchase_receive	Receive PO PO-2025-11-0186	2025-12-01 16:05:32.111171	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
13fa5843-73df-4e27-9ef1-7ca69e44a2fb	55843c0d-d32d-4024-897c-854069db0f81	inbound	increase	2	2	bbf23019-1ccb-4a5f-89e9-58c7e87e08f6	purchase_receive	Receive PO PO-2025-11-0186	2025-12-01 16:05:32.111171	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
5ca51e0c-c2e3-4971-95cd-6fe3da2d0b2e	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	inbound	increase	3	3	d04de5c9-a8cd-4ccd-9500-c751d64490d7	purchase_receive	Receive PO PO-2025-11-0195	2025-12-01 16:05:57.371647	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
012f4e7e-2d66-4b45-8605-01ff4357b9f5	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	1	1	d04de5c9-a8cd-4ccd-9500-c751d64490d7	purchase_receive	Receive PO PO-2025-11-0195	2025-12-01 16:05:57.371647	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
75ab6cab-7481-4bbd-bc17-6c02c8e7a043	88eb8906-5332-456d-aa94-4aacedbf198f	inbound	increase	2	2	d04de5c9-a8cd-4ccd-9500-c751d64490d7	purchase_receive	Receive PO PO-2025-11-0195	2025-12-01 16:05:57.371647	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
46ccceb1-4b57-4354-a910-0260c6959dbe	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	5	7	d04de5c9-a8cd-4ccd-9500-c751d64490d7	purchase_receive	Receive PO PO-2025-11-0195	2025-12-01 16:05:57.371647	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
7adcd9d6-7e21-4022-8cca-2f06306f970e	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	1	8	98748981-3216-40ea-a285-affcff6d826e	purchase_receive	Receive PO PO-2025-11-0187	2025-12-01 16:06:19.083412	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
a711a0e0-9f2f-43de-8b35-988707f803a8	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	5	6	98748981-3216-40ea-a285-affcff6d826e	purchase_receive	Receive PO PO-2025-11-0187	2025-12-01 16:06:19.083412	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
cdfef930-d0d3-4aa2-bb55-1e5f80637b7e	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	inbound	increase	3	3	98748981-3216-40ea-a285-affcff6d826e	purchase_receive	Receive PO PO-2025-11-0187	2025-12-01 16:06:19.083412	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
87cb9cb8-e4fa-4edd-a277-4a7010d61b9c	e15f9138-0b4f-4da6-b620-f3af2cc24df6	inbound	increase	1	1	98748981-3216-40ea-a285-affcff6d826e	purchase_receive	Receive PO PO-2025-11-0187	2025-12-01 16:06:19.083412	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
5a177134-8439-4c13-acc8-0575b368ec05	88eb8906-5332-456d-aa94-4aacedbf198f	inbound	increase	2	4	72651f05-322d-4c08-aed7-4b8d84052e0a	purchase_receive	Receive PO PO-2025-11-0188	2025-12-01 16:06:46.698845	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
2cdafb20-1d6e-4b9a-9cec-22a51d0515e7	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	inbound	increase	5	5	72651f05-322d-4c08-aed7-4b8d84052e0a	purchase_receive	Receive PO PO-2025-11-0188	2025-12-01 16:06:46.698845	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
8de2aef5-2322-42b7-9167-ed099e0a6f53	807d0a7e-7446-4a11-baa5-5693abbd3c57	inbound	increase	4	4	72651f05-322d-4c08-aed7-4b8d84052e0a	purchase_receive	Receive PO PO-2025-11-0188	2025-12-01 16:06:46.698845	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
91636056-37d6-4631-86ea-3b044e63aa0f	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	inbound	increase	5	5	72651f05-322d-4c08-aed7-4b8d84052e0a	purchase_receive	Receive PO PO-2025-11-0188	2025-12-01 16:06:46.698845	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
46e90527-58f5-498d-bdfb-c235e7570b05	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	inbound	increase	2	2	2165e74f-59cb-4ddd-9425-1f313f42bcdc	purchase_receive	Receive PO PO-2025-11-0189	2025-12-01 16:07:03.796351	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
c253edbd-8550-4757-9ead-1f47343e18de	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	inbound	increase	1	4	2165e74f-59cb-4ddd-9425-1f313f42bcdc	purchase_receive	Receive PO PO-2025-11-0189	2025-12-01 16:07:03.796351	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
c383db7a-2913-48f0-afe3-df537d057be0	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	inbound	increase	3	3	2165e74f-59cb-4ddd-9425-1f313f42bcdc	purchase_receive	Receive PO PO-2025-11-0189	2025-12-01 16:07:03.796351	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
696a2a9d-c55b-4e8b-8de7-3afc8d915e3b	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	2	2	2165e74f-59cb-4ddd-9425-1f313f42bcdc	purchase_receive	Receive PO PO-2025-11-0189	2025-12-01 16:07:03.796351	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
00a02c50-326f-4c4f-a4f2-f8698fccc83d	02540f95-d36f-4d7a-9eef-df9e84fe24ca	inbound	increase	5	9	f539bada-5d9c-49b5-b298-5d0ab8fc3d99	purchase_receive	Receive PO PO-2025-11-0190	2025-12-01 16:07:19.294579	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
a02de68a-e453-4af5-9f56-7888bae116f4	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	2	5	f539bada-5d9c-49b5-b298-5d0ab8fc3d99	purchase_receive	Receive PO PO-2025-11-0190	2025-12-01 16:07:19.294579	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
d17ab32e-aac2-4f29-aac0-530b163daebe	e321c296-e580-4da3-89ba-99fe46477ae1	inbound	increase	1	4	f539bada-5d9c-49b5-b298-5d0ab8fc3d99	purchase_receive	Receive PO PO-2025-11-0190	2025-12-01 16:07:19.294579	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
a960c339-a74a-49d3-9ad5-2b24e9747dee	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	5	5	039f7851-a280-4178-b8e1-814c7faa8b6a	purchase_receive	Receive PO PO-2025-11-0191	2025-12-01 16:07:34.430984	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
ddc01e43-fb15-425b-87d9-5c4e8dcd692f	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	inbound	increase	2	2	039f7851-a280-4178-b8e1-814c7faa8b6a	purchase_receive	Receive PO PO-2025-11-0191	2025-12-01 16:07:34.430984	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
4ccd9036-e37f-4f15-94b4-655623faec7d	02540f95-d36f-4d7a-9eef-df9e84fe24ca	inbound	increase	2	2	039f7851-a280-4178-b8e1-814c7faa8b6a	purchase_receive	Receive PO PO-2025-11-0191	2025-12-01 16:07:34.430984	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
ec6c2b69-52ea-4867-ab16-12e85202ed2d	88eb8906-5332-456d-aa94-4aacedbf198f	inbound	increase	1	1	a9df3903-1ac1-4929-b917-f41134cc8ff6	purchase_receive	Receive PO PO-2025-11-0192	2025-12-01 16:07:47.934772	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
27fabcbc-43ec-4aa2-bb58-9d6aeded3887	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	inbound	increase	1	5	a9df3903-1ac1-4929-b917-f41134cc8ff6	purchase_receive	Receive PO PO-2025-11-0192	2025-12-01 16:07:47.934772	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
f01d1c68-aa36-4a3a-b981-7a5872b3de67	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	inbound	increase	2	3	a9df3903-1ac1-4929-b917-f41134cc8ff6	purchase_receive	Receive PO PO-2025-11-0192	2025-12-01 16:07:47.934772	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
8c6326ac-6902-4bab-a3ba-acffffb447d3	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	inbound	increase	4	8	c7fbdde9-31d3-41ba-a235-c204a7a75643	purchase_receive	Receive PO PO-2025-11-0193	2025-12-01 16:08:01.496753	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
992ac8bb-9826-4585-9e89-98784008ab3a	55843c0d-d32d-4024-897c-854069db0f81	inbound	increase	1	3	c7fbdde9-31d3-41ba-a235-c204a7a75643	purchase_receive	Receive PO PO-2025-11-0193	2025-12-01 16:08:01.496753	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
06d37636-4b53-45b1-9271-616c85e70fc0	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	1	9	c7fbdde9-31d3-41ba-a235-c204a7a75643	purchase_receive	Receive PO PO-2025-11-0193	2025-12-01 16:08:01.496753	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
09437b53-c26c-487c-bb27-3b82ba3f2ab5	807d0a7e-7446-4a11-baa5-5693abbd3c57	inbound	increase	5	5	64aed723-5881-4a0e-8fea-9248f1d7a252	purchase_receive	Receive PO PO-2025-11-0194	2025-12-01 16:08:18.42771	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
4c3a7174-eef3-4f17-afc7-98ff47dc3807	88eb8906-5332-456d-aa94-4aacedbf198f	inbound	increase	2	3	64aed723-5881-4a0e-8fea-9248f1d7a252	purchase_receive	Receive PO PO-2025-11-0194	2025-12-01 16:08:18.42771	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
f82e96f3-9366-4718-bf22-3791a3fd3245	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	inbound	increase	2	5	64aed723-5881-4a0e-8fea-9248f1d7a252	purchase_receive	Receive PO PO-2025-11-0194	2025-12-01 16:08:18.42771	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
a70e4064-fede-4c62-b2c2-f00e683b7c51	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	inbound	increase	2	9	d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	purchase_receive	Receive PO PO-2025-11-0180	2025-12-01 16:34:47.771226	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
942f2a21-386c-42df-8182-a886a89bfc15	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	inbound	increase	2	2	d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	purchase_receive	Receive PO PO-2025-11-0180	2025-12-01 16:34:47.771226	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
2526dff1-2113-40fb-89ae-f8abfdbb854e	55843c0d-d32d-4024-897c-854069db0f81	inbound	increase	2	7	d29d2a80-2bff-40fe-9a9e-cf6f4c2294ff	purchase_receive	Receive PO PO-2025-11-0180	2025-12-01 16:34:47.771226	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
2408a18e-171b-4f67-a2f6-107a9a63a573	807d0a7e-7446-4a11-baa5-5693abbd3c57	inbound	increase	10	15	ef774811-dc26-412f-867f-19031237c754	goods_receipt	Goods Receipt GR-2025-12-0001	2025-12-02 16:31:14.611766	a13f2ee7-a32c-433d-88c6-d463803dfd8c	\N	4f1c5549-89d7-4335-981e-d042996c550f
af211408-a765-40ac-9cc8-44a781b30a1d	fa77d16b-ba27-41d0-92ae-307788844f65	outbound	decrease	1	0	4e046b49-7476-4eb2-84b2-5162a7fb5dd2	goods_issue	Goods Issue GI-2025-12-0001	2025-12-02 16:54:49.951381	566f6344-474a-43b5-a400-dfde48a6d0e3	4f1c5549-89d7-4335-981e-d042996c550f	\N
049e3ce0-2863-41d3-b52e-668b6e966326	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	outbound	decrease	1	5	904436da-29c0-424a-8d4c-c6e7e62b47d4	transfer	Goods Issue Transfer GI-2025-12-0002	2025-12-02 16:56:50.445898	566f6344-474a-43b5-a400-dfde48a6d0e3	4f1c5549-89d7-4335-981e-d042996c550f	\N
27f2cbe3-d996-4b2b-9023-db3835eb0a2b	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	1	1	904436da-29c0-424a-8d4c-c6e7e62b47d4	transfer	Goods Issue Transfer GI-2025-12-0002	2025-12-02 16:56:50.445898	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
0441b387-63a4-4197-b90e-e9e6ae133752	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	1	6	9e9a67ee-f7d7-490c-9a2f-b6064e5a2bd7	goods_receipt	Goods Receipt GR-2025-12-0002	2025-12-03 23:38:40.495992	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
73a42ea5-ee83-4f7c-8674-b4a126eecbba	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	outbound	decrease	1	4	1eb05076-5ef9-43aa-8409-c14c99cbbd8b	goods_issue	Goods Issue GI-2025-12-0003	2025-12-04 10:39:58.977655	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	4f1c5549-89d7-4335-981e-d042996c550f	\N
1ed6a062-06a2-489c-9d78-1c919f2026ed	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	outbound	decrease	1	8	1eb05076-5ef9-43aa-8409-c14c99cbbd8b	goods_issue	Goods Issue GI-2025-12-0003	2025-12-04 10:39:58.977655	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	4f1c5549-89d7-4335-981e-d042996c550f	\N
049a1f69-5f2e-4c1a-a8ee-61b7a2ee9f34	d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42	adjustment	increase	1	5	a022656b-3c73-4514-a6ec-3cfb5141b51f	stock_adjustment	Stock Adjustment ADJ-2025-12-0001	2025-12-04 10:58:48.731058	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
8864e0ab-12b6-470f-ac76-d4b6626a1a46	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	adjustment	increase	1	9	a022656b-3c73-4514-a6ec-3cfb5141b51f	stock_adjustment	Stock Adjustment ADJ-2025-12-0001	2025-12-04 10:58:48.731058	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
a43eb4b9-cf59-4d83-acda-074e4feba476	db159f69-afbb-44bd-a04e-35880e5d408f	adjustment	decrease	1	5	9a5fa761-8d53-4311-810f-01e2ade5ae70	stock_opname	Stock Opname OPN-2025-0001	2025-12-05 09:41:02.89495	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	\N
bae9b8fe-bf0d-486f-8199-a0ffdac361db	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	inbound	increase	1	1	dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	purchase_receive	Receive PO PO-2025-11-0168	2025-12-08 10:05:00.124778	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
7d5adb0f-094f-498a-8c34-55c9ea07721e	0624daad-fbd5-4957-a2a8-ddbc54fba5f5	inbound	increase	1	1	dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	purchase_receive	Receive PO PO-2025-11-0168	2025-12-08 10:05:00.124778	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
e34a0ed6-de97-485f-aa83-ed91f471a6bf	e15f9138-0b4f-4da6-b620-f3af2cc24df6	inbound	increase	4	5	dbb5f8aa-bcd8-4625-9e91-e4373c92ee78	purchase_receive	Receive PO PO-2025-11-0168	2025-12-08 10:05:00.124778	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
9a2f244c-8c52-4f90-a0cc-a28780a346d7	e321c296-e580-4da3-89ba-99fe46477ae1	inbound	increase	4	4	a6db83c5-32e3-4c2d-892b-b64047b8b5db	purchase_receive	Receive PO PO-2025-11-0169	2025-12-08 10:05:43.78558	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
173ff390-471b-47df-9bca-5589dc522e64	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	5	5	a6db83c5-32e3-4c2d-892b-b64047b8b5db	purchase_receive	Receive PO PO-2025-11-0169	2025-12-08 10:05:43.78558	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
c5120e34-172a-451d-94b7-5c26bb506958	d3c9af78-58bd-4649-a6da-19a07ae8844e	inbound	increase	4	4	a6db83c5-32e3-4c2d-892b-b64047b8b5db	purchase_receive	Receive PO PO-2025-11-0169	2025-12-08 10:05:43.78558	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
e1cdadd3-a96e-4df6-b8d6-4406a0a926fb	e321c296-e580-4da3-89ba-99fe46477ae1	inbound	increase	4	8	ed068947-beb6-4906-b2e1-d72d8fb5fc4f	purchase_receive	Receive PO PO-2025-11-0169	2025-12-08 10:05:49.074882	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
4bd9731d-8b7c-4ab3-ad9f-d1bcf65f703a	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	5	10	ed068947-beb6-4906-b2e1-d72d8fb5fc4f	purchase_receive	Receive PO PO-2025-11-0169	2025-12-08 10:05:49.074882	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
095b4450-ed89-4f41-9f35-7bb4f2000e69	d3c9af78-58bd-4649-a6da-19a07ae8844e	inbound	increase	4	8	ed068947-beb6-4906-b2e1-d72d8fb5fc4f	purchase_receive	Receive PO PO-2025-11-0169	2025-12-08 10:05:49.074882	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
ebc9ffe3-e047-4d4d-96e7-6d9cef12b36a	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	3	8	ec0fcf47-b733-43d3-a36f-390806ac7b78	purchase_receive	Receive PO PO-2025-11-0179	2025-12-08 10:09:32.158476	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
5d893759-de26-4514-b337-7e42a9580e5b	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	3	4	ec0fcf47-b733-43d3-a36f-390806ac7b78	purchase_receive	Receive PO PO-2025-11-0179	2025-12-08 10:09:32.158476	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
1ad07782-c473-44c5-ab85-84343453e0ff	fa77d16b-ba27-41d0-92ae-307788844f65	inbound	increase	3	3	ec0fcf47-b733-43d3-a36f-390806ac7b78	purchase_receive	Receive PO PO-2025-11-0179	2025-12-08 10:09:32.158476	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
84a87d0e-b80f-4ca0-a358-47114e3e8b94	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	inbound	increase	5	5	c83c5729-2a64-4c23-bcb3-f30769320754	purchase_receive	Receive PO PO-2025-11-0170	2025-12-08 10:19:24.765298	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
608fbd5a-d7f5-4d26-a883-81a1a32d0cea	d3c9af78-58bd-4649-a6da-19a07ae8844e	inbound	increase	3	3	c83c5729-2a64-4c23-bcb3-f30769320754	purchase_receive	Receive PO PO-2025-11-0170	2025-12-08 10:19:24.765298	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
e4dd650d-9425-405f-8041-2c140fa70a7e	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	inbound	increase	1	3	c83c5729-2a64-4c23-bcb3-f30769320754	purchase_receive	Receive PO PO-2025-11-0170	2025-12-08 10:19:24.765298	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
c2714921-8f8d-4470-aa66-3a11abbc4d1c	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	inbound	increase	4	4	ec89f36f-cd37-432b-8b4d-a7a44aca91f9	purchase_receive	Receive PO PO-2025-11-0178	2025-12-08 10:22:05.872776	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
cb6e4ef5-c7c0-444f-8fab-d41db65e09a7	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	3	13	ec89f36f-cd37-432b-8b4d-a7a44aca91f9	purchase_receive	Receive PO PO-2025-11-0178	2025-12-08 10:22:05.872776	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
3b3f6dbe-830d-4d26-916f-c7c163d63c23	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	inbound	increase	3	3	ec89f36f-cd37-432b-8b4d-a7a44aca91f9	purchase_receive	Receive PO PO-2025-11-0178	2025-12-08 10:22:05.872776	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
c953b68c-7986-46e6-a389-b7adadbce012	55843c0d-d32d-4024-897c-854069db0f81	inbound	increase	1	1	87a15dba-e270-42b3-ab32-d2df9cee5759	goods_receipt	Goods Receipt GR-2025-12-0003	2025-12-08 10:23:02.118271	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
9e89e083-2c0f-4af9-9eed-8a14e61e5e09	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	inbound	increase	1	1	21a072b1-8c69-4c75-bba9-1a8fc158f13f	goods_receipt	Goods Receipt GR-2025-12-0004	2025-12-08 10:27:30.61265	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
30b6de08-9c41-4730-a0e2-4e0bc8fbd056	fa77d16b-ba27-41d0-92ae-307788844f65	inbound	increase	2	5	a9271c4f-2d4d-49ac-98a5-44db9a0af12c	goods_receipt	Goods Receipt GR-2025-12-0005	2025-12-08 10:31:03.370898	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
bee62d05-45ed-4b33-a526-3aa3ac34029b	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	outbound	decrease	1	8	995a76a9-75ae-4585-976f-ddfbf04ab09e	goods_issue	Goods Issue GI-2025-12-0004	2025-12-08 13:44:33.675295	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	4f1c5549-89d7-4335-981e-d042996c550f	\N
ad4203ee-1e64-49e9-a412-e83ac41ea87f	8c830d37-6be1-4a54-9e8b-d9fcdfafad16	outbound	decrease	1	0	9f8dc96d-2319-4276-9a5f-ccc36d7a0ed3	goods_issue	Goods Issue GI-2025-12-0005	2025-12-08 13:45:50.128289	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
621a05ca-0743-4395-94ee-40b655529551	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	adjustment	increase	2	5	b780eb24-ca6d-4e72-b75a-3fc34957ec8d	stock_adjustment	Stock Adjustment ADJ-2025-12-0003	2025-12-08 15:25:51.836162	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	4f1c5549-89d7-4335-981e-d042996c550f
3e51c295-e8f8-4876-a321-90ee25c69bcf	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	10	10	52cb2086-76b7-40e5-819c-2dc8ef77b1c2	purchase_receive	Receive PO PO-2025-12-0004	2025-12-11 10:39:04.169323	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
d6113216-06e9-4929-bb02-d819c59e800c	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	10	20	52cb2086-76b7-40e5-819c-2dc8ef77b1c2	purchase_receive	Receive PO PO-2025-12-0004	2025-12-11 10:39:04.169323	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
57bb5cf3-ccad-4f79-8089-e17ec818ac97	e15f9138-0b4f-4da6-b620-f3af2cc24df6	inbound	increase	10	10	52cb2086-76b7-40e5-819c-2dc8ef77b1c2	purchase_receive	Receive PO PO-2025-12-0004	2025-12-11 10:39:04.169323	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
10d6a32c-127e-42dd-a300-45dfa5aada1b	55843c0d-d32d-4024-897c-854069db0f81	inbound	increase	1	1	c7b869c5-76a5-48bf-973a-abddd5438ef3	purchase_receive	Receive PO PO-2025-12-0003	2025-12-11 10:40:12.584841	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
f7c5788b-77dc-4ce2-b2a8-3e620fe78e1c	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	inbound	increase	2	2	c52e42ce-61cf-4ca6-83de-9d39b3324b94	purchase_receive	Receive PO PO-2025-11-0174	2025-12-11 10:54:20.435712	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
f89b5138-4f39-4d4e-a9f2-e968ee00e52f	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	inbound	increase	2	2	c52e42ce-61cf-4ca6-83de-9d39b3324b94	purchase_receive	Receive PO PO-2025-11-0174	2025-12-11 10:54:20.435712	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
11b7b8ec-3c0b-47a8-9f7d-49f9cd7e3bf6	3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52	inbound	increase	2	2	c52e42ce-61cf-4ca6-83de-9d39b3324b94	purchase_receive	Receive PO PO-2025-11-0174	2025-12-11 10:54:20.435712	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
3989bada-fbc8-478e-a7de-6cc28e745b54	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	2	2	c52e42ce-61cf-4ca6-83de-9d39b3324b94	purchase_receive	Receive PO PO-2025-11-0174	2025-12-11 10:54:20.435712	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
2c6dcfef-4570-4e3e-9e8f-545c66e570cb	7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615	inbound	increase	2	2	d482c60f-a043-4683-b662-0aad47a31575	purchase_receive	Receive PO PO-2025-11-0180	2025-12-11 13:16:01.233793	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
c2bca207-b4bd-489a-ad14-d8b51dd2f93e	d3c9af78-58bd-4649-a6da-19a07ae8844e	inbound	increase	5	5	182c1c96-659c-4034-a0ca-b8da96e873c7	goods_receipt	Goods Receipt GR-2025-12-0006	2025-12-12 20:08:28.37505	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
a881d37e-b546-4525-8889-b8802c4c57dd	db159f69-afbb-44bd-a04e-35880e5d408f	inbound	increase	2	4	182c1c96-659c-4034-a0ca-b8da96e873c7	goods_receipt	Goods Receipt GR-2025-12-0006	2025-12-12 20:08:28.37505	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
423d1666-f81f-4cc5-a458-93beea161b79	e15f9138-0b4f-4da6-b620-f3af2cc24df6	inbound	increase	3	13	182c1c96-659c-4034-a0ca-b8da96e873c7	goods_receipt	Goods Receipt GR-2025-12-0006	2025-12-12 20:08:28.37505	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
2295dd5a-ea9a-4d92-9e3c-0a3f56be929a	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	inbound	increase	1	5	09563c43-bd85-47cd-905a-63e0d5b8dcf8	goods_receipt	Goods Receipt GR-2025-12-0007	2025-12-12 20:09:25.928469	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
c7f85915-6a36-489d-b7cc-2af727128a50	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	inbound	increase	1	1	ee272565-0ec5-46a2-a867-3fdfee99ea24	goods_receipt	Goods Receipt GR-2025-12-0008	2025-12-12 20:11:36.153977	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
bf8c9da7-b367-477f-92f6-4b3ae2c9ec80	0624daad-fbd5-4957-a2a8-ddbc54fba5f5	outbound	decrease	1	0	d6ab6924-ed48-4524-97a4-26c949142023	goods_issue	Goods Issue GI-2025-12-0006	2025-12-12 20:17:45.305888	566f6344-474a-43b5-a400-dfde48a6d0e3	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
1a50472c-d77a-4e85-96e5-77c0a539fb15	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	adjustment	decrease	1	2	cc38e709-5a7a-45eb-aea7-be2e7999b303	stock_adjustment	Stock Adjustment ADJ-2025-12-0004	2025-12-16 11:04:58.369778	566f6344-474a-43b5-a400-dfde48a6d0e3	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	\N
bb716d08-1c81-4617-83dd-033cf72f0529	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	adjustment	decrease	1	4	cc38e709-5a7a-45eb-aea7-be2e7999b303	stock_adjustment	Stock Adjustment ADJ-2025-12-0004	2025-12-16 11:04:58.369778	566f6344-474a-43b5-a400-dfde48a6d0e3	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	\N
7cab3906-47ba-48ed-9742-a435d11ba120	64bf77fb-feba-4e4c-aa73-b323b62a0bc7	adjustment	increase	1	3	8e842ec0-99b0-4408-a5b1-2118b1c5a633	stock_adjustment	Stock Adjustment ADJ-2025-12-0005	2025-12-16 11:21:53.09724	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19
12a8e5b4-c5d2-4180-9cfa-fb4340c4d40a	ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8	adjustment	increase	1	5	8e842ec0-99b0-4408-a5b1-2118b1c5a633	stock_adjustment	Stock Adjustment ADJ-2025-12-0005	2025-12-16 11:21:53.09724	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd
88466fd4-b5da-47aa-a9f8-53dc66f7d564	e15f9138-0b4f-4da6-b620-f3af2cc24df6	adjustment	decrease	1	12	8e842ec0-99b0-4408-a5b1-2118b1c5a633	stock_adjustment	Stock Adjustment ADJ-2025-12-0005	2025-12-16 11:21:53.09724	566f6344-474a-43b5-a400-dfde48a6d0e3	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	\N
5223cd07-b1f0-4b3f-9ff8-dae434655368	e15f9138-0b4f-4da6-b620-f3af2cc24df6	adjustment	increase	1	13	8ca7969e-b199-4daa-95e3-8f865fcd1854	stock_opname	Stock Opname OPN-2025-0006	2025-12-16 20:19:09.064352	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1
69961032-b885-40f1-bb51-1b42ee9bcc8c	88eb8906-5332-456d-aa94-4aacedbf198f	inbound	increase	10	13	55436c9d-09fb-4bcf-93fa-c75da5112115	purchase_receive	Receive PO PO-2025-12-0006	2025-12-17 15:00:37.724313	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	4f1c5549-89d7-4335-981e-d042996c550f
c10ac60d-088e-47af-a8da-706064a30fc4	25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf	inbound	increase	10	15	55436c9d-09fb-4bcf-93fa-c75da5112115	purchase_receive	Receive PO PO-2025-12-0006	2025-12-17 15:00:37.724313	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	4f1c5549-89d7-4335-981e-d042996c550f
e75e3b79-0835-4576-8e99-8b843d561fa3	a880bcc5-d001-4ed1-9378-33e5f71bf3df	inbound	increase	10	10	55436c9d-09fb-4bcf-93fa-c75da5112115	purchase_receive	Receive PO PO-2025-12-0006	2025-12-17 15:00:37.724313	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	4f1c5549-89d7-4335-981e-d042996c550f
\.


--
-- Data for Name: stock_opname_items; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_opname_items (id, opname_id, item_id, quantity_counted, quantity_system) FROM stdin;
3556eacd-128d-4ab1-ac98-b5490113c1c8	9a5fa761-8d53-4311-810f-01e2ade5ae70	fa77d16b-ba27-41d0-92ae-307788844f65	2.00	2.00
fce7d60b-1a4a-4204-ac86-3c94fca2ceb9	9a5fa761-8d53-4311-810f-01e2ade5ae70	807d0a7e-7446-4a11-baa5-5693abbd3c57	4.00	4.00
7f2811fd-5baa-4424-aa69-3728c573e10e	9a5fa761-8d53-4311-810f-01e2ade5ae70	db159f69-afbb-44bd-a04e-35880e5d408f	5.00	6.00
f5a722ba-86d8-46ca-a99c-d6a88b734ad9	63d6dcda-9816-44b0-9135-404b1631ec66	55843c0d-d32d-4024-897c-854069db0f81	10.00	7.00
a3ec4ef9-824b-493a-a93b-b36df15592c5	63d6dcda-9816-44b0-9135-404b1631ec66	db159f69-afbb-44bd-a04e-35880e5d408f	10.00	5.00
828cbf0d-e7f4-45c0-b254-593d086204b7	47bb61ec-1924-4a46-8210-133e63d96a32	db159f69-afbb-44bd-a04e-35880e5d408f	5.00	5.00
e89dbf5a-ba2e-4ed4-9459-94b01ef96b2b	47bb61ec-1924-4a46-8210-133e63d96a32	1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab	6.00	6.00
121073ab-b894-4402-b5f2-a42ea3b8d8e4	21e377df-61f6-4fd6-b613-205251b94018	db159f69-afbb-44bd-a04e-35880e5d408f	8.00	8.00
fb0b2ca6-55ed-4191-8d98-ec4466c5ecee	21e377df-61f6-4fd6-b613-205251b94018	e4c08e3e-dfa1-4b4d-9b95-44528a3e9834	4.00	4.00
d23aead0-a79c-4352-bb78-a7746cd7a2c1	9d7c69b3-0c82-4049-aa15-c680d9d17eca	a880bcc5-d001-4ed1-9378-33e5f71bf3df	9.00	9.00
deda0da0-e875-4d63-9db0-a52edae4ecf5	9d7c69b3-0c82-4049-aa15-c680d9d17eca	db159f69-afbb-44bd-a04e-35880e5d408f	5.00	5.00
3701ba96-58ca-4515-a13a-f2fdcf11718b	8ca7969e-b199-4daa-95e3-8f865fcd1854	e15f9138-0b4f-4da6-b620-f3af2cc24df6	13.00	12.00
\.


--
-- Data for Name: stock_opnames; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.stock_opnames (id, location_id, opname_date, status, notes, created_by, approved_by, opname_number, created_at, updated_at, updated_by, reviewed_at, reviewed_by, review_note, canceled_at, canceled_by, finalized_at, finalized_by) FROM stdin;
9a5fa761-8d53-4311-810f-01e2ade5ae70	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	2025-12-05	finalized	First opname	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	OPN-2025-0001	2025-12-05 09:17:34.277896+07	\N	\N	2025-12-05 09:39:56.550451+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	Opname reviewed and approved	\N	\N	2025-12-05 09:41:02.89495+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4
63d6dcda-9816-44b0-9135-404b1631ec66	4f1c5549-89d7-4335-981e-d042996c550f	2025-12-05	canceled	2nd Opname	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	OPN-2025-0002	2025-12-05 09:41:44.258352+07	\N	\N	2025-12-05 09:44:05.375736+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	not approved	2025-12-05 09:44:31.183635+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	\N
47bb61ec-1924-4a46-8210-133e63d96a32	4f1c5549-89d7-4335-981e-d042996c550f	2025-12-05	canceled	3rd opname	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	OPN-2025-0003	2025-12-05 09:45:17.027492+07	\N	\N	\N	\N	\N	2025-12-05 09:45:53.914821+07	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	\N
21e377df-61f6-4fd6-b613-205251b94018	9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19	2025-12-06	canceled	december opname	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	\N	OPN-2025-0004	2025-12-08 15:27:45.665905+07	2025-12-16 19:07:31.991875+07	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-16 19:07:31.991875+07	566f6344-474a-43b5-a400-dfde48a6d0e3	some items are broken	2025-12-16 20:17:22.210108+07	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	\N
9d7c69b3-0c82-4049-aa15-c680d9d17eca	821bf1e2-c94c-4c30-b71d-e8b7b6b740fd	2025-12-12	canceled	2nd week december opname	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	OPN-2025-0005	2025-12-16 18:34:35.418203+07	2025-12-16 19:36:40.022254+07	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-16 19:36:40.022254+07	566f6344-474a-43b5-a400-dfde48a6d0e3	done review	2025-12-16 20:17:25.886979+07	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	\N
8ca7969e-b199-4daa-95e3-8f865fcd1854	66085b0d-dfcd-4a56-8a3f-1e5ab6d961f1	2025-12-15	finalized	item repaired	566f6344-474a-43b5-a400-dfde48a6d0e3	\N	OPN-2025-0006	2025-12-16 20:18:49.433986+07	2025-12-16 20:19:03.106907+07	566f6344-474a-43b5-a400-dfde48a6d0e3	2025-12-16 20:19:03.106907+07	566f6344-474a-43b5-a400-dfde48a6d0e3	ok	\N	\N	2025-12-16 20:19:09.064352+07	566f6344-474a-43b5-a400-dfde48a6d0e3
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: inventory; Owner: -
--

COPY inventory.suppliers (id, name, contact, address, deleted_at, updated_at) FROM stdin;
c1a42114-aa3b-4e09-8bd1-778adc4a9ce3	Prime Trading Supply	0812-1234-5678	Jakarta	\N	\N
34de6448-2a85-4adb-b878-8aa2208c1466	Reliable Commercial Partners	0813-9876-1111	Bandung	\N	\N
fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5	Advance Growth Industries	0812-8888-9999	Surabaya	\N	\N
368f9a28-0dca-4d02-add7-14cdabedf31c	Pristine Furniture	+62 828 9992 231	Surabaya	\N	2025-12-10 12:52:20.849697+07
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_settings (id, app_name, app_logo, updated_at) FROM stdin;
63f5f356-fc79-4d21-86a9-52321af6a2e1	Inventory Demo	\N	2025-11-25 09:10:51.639968
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, parent_id, path, created_at, updated_at, description, deleted_at) FROM stdin;
469caf61-5334-4d6a-bc69-0d766cd3ee6f	IT/DEV	\N	\N	2025-11-25 09:14:01.642204+07	2025-11-25 09:14:01.642204+07	Manage Application	\N
a48ee66a-5401-46b3-bc57-c4d971f6b716	Staff	\N	\N	2025-11-25 09:21:34.536346+07	2025-11-25 09:21:34.536346+07	Staff	\N
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) FROM stdin;
96753e62-04d8-4a88-bfe6-e7e851a41a31	f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	command	Logout	RiShutDownFill	\N	logout	sliding	end	0	6	logout from current user	\N	\N
d932c843-51bf-4220-a247-27884bf7cc3b	e2ec2934-c806-4bd7-9162-5697c5e93a38	\N	group	Reports	RiBarChartBoxFill	\N	\N	sliding	start	0	7	Reports	\N	\N
8160376e-3a90-487a-83cf-0365644ed207	e2ec2934-c806-4bd7-9162-5697c5e93a38	\N	group	Inventory Monitoring	RiBarcodeBoxLine	\N	\N	sliding	start	0	6	Inventory Monitoring	\N	\N
e2ec2934-c806-4bd7-9162-5697c5e93a38	\N	\N	group	Monitoring	RiTvFill	\N	\N	sliding	start	0	4	List menu untuk keperluat monitoring inventory	\N	\N
1a7d88ad-519a-4075-aecb-6d3b3966d791	\N	\N	group	preferences	RiUserSettingsFill	\N	\N	sliding	end	0	5	user preferences	\N	\N
0a6b6741-5262-48dc-a00b-e97bb6b9da3c	\N	\N	group	Master Data	RiDatabase2Fill	\N	\N	sliding	start	0	1	Manage Master Data	\N	\N
d32186e2-53e1-498b-a0cb-acb8d81c7ed6	\N	\N	group	Purchasing	RiShoppingBag3Fill	\N	\N	sliding	start	0	2	Purchasing	\N	\N
f963974e-9b54-4d09-9cff-63762eecb0eb	d32186e2-53e1-498b-a0cb-acb8d81c7ed6	\N	group	Purchase Orders	RiShoppingCart2Fill	\N	\N	sliding	start	0	8	Purchase Orders	\N	\N
ecbbbe7f-4fa6-4085-b1ef-6bfa441647c9	d32186e2-53e1-498b-a0cb-acb8d81c7ed6	\N	group	Goods Receipts	RiShoppingBasket2Fill	\N	\N	sliding	start	0	9	Goods Receipts	\N	\N
3adfe1af-0c8b-4a52-882f-ba3722b787a3	\N	\N	group	Inventory Operations	RiBookShelfFill	\N	\N	sliding	start	0	3	Inventory Operations	\N	\N
f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	\N	group	app setting	RiSettings3Fill	\N	\N	sliding	end	0	9	setting aplikasi	\N	\N
d6e1a3b4-06d5-4323-a912-cd170334e4b2	f963974e-9b54-4d09-9cff-63762eecb0eb	\N	route	Create / Manage PO	RiShoppingCartFill	/pages/inventory/purchase-order		sliding	start	0	1	Create / Manage PO	\N	\N
b8b9f6ae-276e-4a9a-8870-b9217f18ec0b	f963974e-9b54-4d09-9cff-63762eecb0eb	\N	route	PO Receipts (KIOSK)	RiShoppingBasket2Fill	/purchase-order/:id/kiosk		sliding	start	0	2	PO Receipts (KIOSK)	\N	\N
0ff78308-3d32-4329-bf89-8d30939cc6af	3adfe1af-0c8b-4a52-882f-ba3722b787a3	\N	route	Inventory Opname	RiRefreshFill	/pages/inventory/stock-opnames		sliding	start	0	7	Inventory Opname	\N	\N
2387c449-e261-48c9-a0cc-026caeb9bd5a	0a6b6741-5262-48dc-a00b-e97bb6b9da3c	\N	route	Items	RiBox2Fill	/pages/inventory/item		sliding	start	0	2	Manage Logitics Item	\N	\N
de76ea18-ece1-48a8-a9f1-2371c5a21277	0a6b6741-5262-48dc-a00b-e97bb6b9da3c	\N	route	Supplier	RiUserCommunityFill	/pages/inventory/supplier		sliding	start	0	3	Manage Suppliers	\N	\N
b002c9dd-9b08-4a0e-a004-909fb1dcc6ea	ecbbbe7f-4fa6-4085-b1ef-6bfa441647c9	\N	route	GR Entry	RiAnticlockwise2Fill	/pages/inventory/goods-receipts		sliding	start	0	3	GR Entry	\N	\N
3410b1bc-a222-4955-b4cc-342138b94483	ecbbbe7f-4fa6-4085-b1ef-6bfa441647c9	\N	route	GR Form	RiFileList3Fill	/goods-receipts/create		sliding	start	0	4	GR Form	\N	\N
2c8166ae-0ce5-4227-8b55-471f227f569d	3adfe1af-0c8b-4a52-882f-ba3722b787a3	\N	route	Goods Issues	RiStore3Fill	/pages/inventory/goods-issues		sliding	start	0	5	Goods Inbound and Outbound	\N	\N
ca0b7f07-175b-48a3-8dd4-8ff6b5139400	8160376e-3a90-487a-83cf-0365644ed207	\N	route	Inventory Movements	RiFileCopy2Fill	/pages/inventory/stock-movements		sliding	start	0	1	Inventory Movements	\N	\N
2d17740b-7a54-4916-a393-f27c9cfbf9ca	8160376e-3a90-487a-83cf-0365644ed207	\N	route	Inventory On Hand	RiHandCoinFill	/pages/inventory/stock-on-hand		sliding	start	0	2	Inventory On Hand	\N	\N
224c4a85-ba30-4999-941d-29f51714744e	8160376e-3a90-487a-83cf-0365644ed207	\N	route	Inventory per Location	RiRoadMapFill	/pages/inventory/stock-location-report		sliding	start	0	4	Inventory per Location	\N	\N
5f9c3aec-69b7-49aa-9f20-380f8d3642b7	d932c843-51bf-4220-a247-27884bf7cc3b	\N	route	Inventory History	RiTimeZoneFill	/pages/inventory/stock-history-report/		sliding	start	0	3	Inventory History	\N	\N
5faabccf-4806-456d-879d-77bddffd23fa	d932c843-51bf-4220-a247-27884bf7cc3b	\N	route	PO Summary	RiTimelineView	/pages/inventory/po-summary		sliding	start	0	5	Purchase Order Summary	\N	\N
8f7523d3-c103-4325-b2de-908b16217db1	1a7d88ad-519a-4075-aecb-6d3b3966d791	\N	route	User Preferences	RiUserSettingsFill	/pages/preferences		sliding	start	0	1	User Preferences	\N	\N
a3d39552-d9e6-427f-b9ac-a0b6b34d46bb	1a7d88ad-519a-4075-aecb-6d3b3966d791	\N	route	User Profile	RiUser5Fill	/profile		sliding	start	0	2	user profile	\N	\N
54a63b1d-2866-4e34-b345-7d7759847b60	f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	route	App Settings	RiSettings4Fill	/pages/app-settings		sliding	start	0	1	setting nama aplikasi dan logo	\N	\N
00c76254-964c-4c47-942c-7e3e4d8dfa4d	f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	route	Departments	RiGroup2Fill	/pages/departments		sliding	start	0	2	Master Departments	\N	\N
e3f69c2d-545f-4711-92bb-34e9af02a6f6	f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	route	Manage Users	RiUserFollowFill	/pages/users		sliding	start	0	3	management users	\N	\N
48e5f14d-807f-4962-be7a-d70a80cdf124	f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	route	Navigation Menu	RiCompass3Fill	/pages/menu		sliding	start	0	4	management users	\N	\N
de1bfba4-635d-40e3-a525-4b7f4419f13f	f97c7ea5-e2e2-495a-bbe0-ca2a9075b459	\N	route	Manage Roles	RiUser2Fill	/pages/roles		sliding	start	0	5	management user roles	\N	\N
39ae7ec6-5736-4f97-b3a6-2a288a825769	8160376e-3a90-487a-83cf-0365644ed207	\N	route	Inventory Details	RiAncientGateLine	/pages/inventory/item-details		sliding	start	0	5	qty of each items in every stored locations	\N	\N
c3b2e81e-c149-4eef-9c14-b67090492d6e	3adfe1af-0c8b-4a52-882f-ba3722b787a3	\N	route	Inventory Adjustments	RiListSettingsFill	/pages/inventory/stock-adjustments		sliding	start	0	6	Inventory Adjustment	\N	\N
c1e55d2b-4ecb-4a8a-91b6-8a58f72d7614	0a6b6741-5262-48dc-a00b-e97bb6b9da3c	\N	route	Inventory Locations	RiDashboardFill	/pages/inventory/stock-location		sliding	start	0	1	Manage Inventory Stored Location	\N	\N
\.


--
-- Data for Name: menu_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_permissions (menu_id, permission_id) FROM stdin;
2387c449-e261-48c9-a0cc-026caeb9bd5a	e391fcf7-0df9-473e-a11a-fb0c672e5223
de76ea18-ece1-48a8-a9f1-2371c5a21277	a6d41266-ae96-4120-b3bf-cbd02b7f6b4f
d6e1a3b4-06d5-4323-a912-cd170334e4b2	82250154-6820-4eb1-9f4f-6d2b4b1b42b1
b8b9f6ae-276e-4a9a-8870-b9217f18ec0b	82250154-6820-4eb1-9f4f-6d2b4b1b42b1
b002c9dd-9b08-4a0e-a004-909fb1dcc6ea	d0ec6eba-0a8f-4f99-b91f-a087c7cd20c5
3410b1bc-a222-4955-b4cc-342138b94483	d0ec6eba-0a8f-4f99-b91f-a087c7cd20c5
2c8166ae-0ce5-4227-8b55-471f227f569d	15bce617-5282-4dc7-9510-36e24bf73c56
5faabccf-4806-456d-879d-77bddffd23fa	7cc161ae-5841-4dcf-9063-571c8ff57e49
8f7523d3-c103-4325-b2de-908b16217db1	810bc639-65bc-41c8-bec5-8e0c5ec9a2c1
a3d39552-d9e6-427f-b9ac-a0b6b34d46bb	d63815df-fe49-4e94-bd32-b04bb642c009
54a63b1d-2866-4e34-b345-7d7759847b60	1e5f56dc-feb6-422d-85bd-6cd7f8761942
00c76254-964c-4c47-942c-7e3e4d8dfa4d	41e4b577-30ac-44f5-86b2-87e34171c5b0
e3f69c2d-545f-4711-92bb-34e9af02a6f6	b7777865-d2b5-4a3e-9b3f-c09e951551ab
48e5f14d-807f-4962-be7a-d70a80cdf124	a661dbce-2e35-48cc-9059-748cedfd3e8c
de1bfba4-635d-40e3-a525-4b7f4419f13f	6658da8c-5460-4be8-ad7b-f3ebef7194fe
39ae7ec6-5736-4f97-b3a6-2a288a825769	1b420dd6-2b92-4648-a454-91f4fccfc9cf
c3b2e81e-c149-4eef-9c14-b67090492d6e	2f97535f-f9ec-4e20-b698-13a944e942e4
0ff78308-3d32-4329-bf89-8d30939cc6af	9540ba45-9c7b-4c91-9531-0d8917bab9c0
ca0b7f07-175b-48a3-8dd4-8ff6b5139400	41aa4d42-e7ad-47b5-84c4-a92bb9d10a67
2d17740b-7a54-4916-a393-f27c9cfbf9ca	63aeba46-9bb0-418e-934f-e1fb1e7ecb81
224c4a85-ba30-4999-941d-29f51714744e	8983ec84-793f-4393-aaf7-76621b46b5f7
5f9c3aec-69b7-49aa-9f20-380f8d3642b7	67d1a8e9-cccf-4fc7-9d1f-d71823087230
c1e55d2b-4ecb-4a8a-91b6-8a58f72d7614	0a7c61d2-5659-4132-ad5c-a39c5721c188
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, name, label, domain, description, deleted_at) FROM stdin;
957f872a-ec05-45e7-b344-fdb840eb95e5	update	mengubah menu	menu	Can update menu	\N
0fb947b7-5225-41a4-b619-b8d1a3505ad1	create	menambahkan menu baru	menu	Can create a new menu	\N
21eaaf06-e089-4ceb-9852-c53f15fdcc3a	delete	hapus supplier	supplier	Able to delete supplier	\N
0bd7f55a-79e2-46f9-9e3f-0986f376574d	update	mengubah supplier	supplier	Can update supplier	\N
e8c9679f-0c8a-4aed-a044-0078a694133f	create	menambahkan supplier baru	supplier	Can create a new supplier	\N
9d68bd7e-7a7a-4e43-9e07-d232b2842213	update	mengubah goods receipts	goods_receipts	Can update goods receipts	\N
ab746370-1ef7-4d8e-9826-22e0edc27161	create	menambahkan goods receipts baru	goods_receipts	Can create a new goods receipt	\N
3e761f25-84d1-4956-8c97-050b450cd570	delete	hapus roles	role	Able to delete role	\N
e6ba7dc8-b1d8-4b1f-ac56-5dc939b58934	update	mengubah roles	role	Can update role details	\N
64e3359e-db44-40e0-8a1d-8bed9dec9e7d	create	menambahkan roles baru	role	Can create a new role	\N
1e5f56dc-feb6-422d-85bd-6cd7f8761942	view	buka halaman app setting management	app_setting	Can open the app setting management page	\N
7703ad68-1e1b-4ebb-bcb4-5cb0188ecf63	approve	approve goods receipts	goods_receipts	Can approve new goods receipts	\N
41e4b577-30ac-44f5-86b2-87e34171c5b0	view	buka halaman department management	department	Can open the department management page	\N
82250154-6820-4eb1-9f4f-6d2b4b1b42b1	view	buka halaman form purchase order	purchase_order	Can open the purchase order page	\N
34d13778-69d1-4f1b-8fab-6b533af8ac42	delete	hapus department	department	Able to delete department	\N
d6c30375-e05c-4e59-b68c-6d1b2d41e0a1	delete	hapus app setting	app_setting	Able to delete app setting	\N
cc4a16b0-9a50-446e-af0f-b8ce413fd4dc	delete	hapus purchase order	purchase_order	Able to delete purchase order	\N
5a37e6fd-73a0-42b8-9c72-78910fa4fd12	update	mengubah department	department	Can update department details	\N
dd36d8e8-420e-4b49-b8bc-37c188e6ba34	receive	receive goods receipts	goods_receipts	Can receive goods receipts	\N
691aa7c8-6b92-4c62-ab37-01e1a0b1618f	update	mengubah purchase order	purchase_order	Can update purchase order	\N
23256f23-90c7-4d0a-91fc-af3b4ed30599	create	menambahkan purchase order baru	purchase_order	Can create a new purchase order	\N
0a85c5d1-be0f-4343-b49c-9d862ec90e4a	approve	approve purchase order	purchase_order	Can approve new purchase order	\N
6b7c91f5-3fb9-449c-9849-ea69c728d851	cancel	cancel goods receipts	goods_receipts	Can cancel goods receipts	\N
5721224c-88bc-48c7-9387-e1def9df4aa0	all_access	Administrator	superadmin	Has access to all features	\N
dd63ce0c-de60-4914-90ef-e573e3959b99	delete	hapus user	user	Able to delete user	\N
21344f03-5daf-4233-bb4b-ac983e3eead2	update	mengubah user	user	Can update user details	\N
72aeb7cd-d9ca-4473-9520-5e7dcc5e1808	create	menambahkan user baru	user	Can create a new user	\N
24e364fa-f169-4d4e-aa1f-515ebbc3d937	create	menambahkan department baru	department	Can create a new department	\N
810bc639-65bc-41c8-bec5-8e0c5ec9a2c1	view	buka halaman preferences management	preferences	Can open the preferences management page	\N
3f58d759-bb58-4844-bfe9-d77a36c1dbb5	delete	hapus preferences	preferences	Able to delete preferences	\N
a129920d-7dfb-4376-bf10-4ee3e3de6b5a	update	mengubah preferences	preferences	Can update preferences	\N
66ef1954-bbf5-4c2a-94dd-66e0828bce5f	create	menambahkan preferences baru	preferences	Can create new preferences	\N
a661dbce-2e35-48cc-9059-748cedfd3e8c	view	buka halaman menu management	menu	Can open the menu management page	\N
cb1adeb6-1bd9-43a9-8c15-8d6dc5ab3a76	update	mengubah app setting	app_setting	Can update app setting	\N
5350b355-1b37-45b1-ad3e-ad0e25cbc74b	create	menambahkan app setting baru	app_setting	Can create a new app setting	\N
d63815df-fe49-4e94-bd32-b04bb642c009	view	buka halaman form user profile	user_profile	Can open the user profile page	\N
abf78059-df84-48eb-8d04-e37c80106500	receive	receive purchase order items	purchase_order	Can receive purchase order items	\N
9e67720c-97e0-430e-884b-89377a3519eb	delete	hapus user profile	user_profile	Able to delete user profile	\N
9a706a95-0f22-4e4c-93cd-566567a172b1	update	mengubah user profile	user_profile	Can update user profile	\N
e391fcf7-0df9-473e-a11a-fb0c672e5223	view	buka halaman form item	item	Can open the item page	\N
32b45501-36e2-4338-bb0f-7e60c43a6406	cancel	cancel purchase order items	purchase_order	Can cancel purchase order items	\N
d0ec6eba-0a8f-4f99-b91f-a087c7cd20c5	view	buka halaman form goods receipts	goods_receipts	Can open the goods receipts page	\N
8e0f1640-3811-4664-b8b0-7ce72f9d66a2	delete	hapus menu	menu	Able to delete menu	\N
d06f0d95-7820-4cfc-8a6f-967d9b13b088	delete	hapus item	item	Able to delete item	\N
687f3fbe-a1f4-44de-8e79-1e811d0ee34f	update	mengubah item	item	Can update item	\N
bdb4c201-a8f8-47fb-800f-078eae49648a	create	menambahkan item baru	item	Can create a new item	\N
2971d49e-2718-4a4b-9076-272990fab5d4	delete	hapus goods receipts	goods_receipts	Able to delete goods receipts	\N
6658da8c-5460-4be8-ad7b-f3ebef7194fe	view	buka halaman role management	role	Can open the role management page	\N
a6d41266-ae96-4120-b3bf-cbd02b7f6b4f	view	buka halaman form supplier	supplier	Can open the supplier page	\N
2f97535f-f9ec-4e20-b698-13a944e942e4	view	Open Inventory Adjustment Page	inventory_adjustment	Can open the inventory adjustment page	\N
fc75d232-b7c4-431f-974d-f4a59e38a3db	delete	Delete Inventory Adjustment	inventory_adjustment	Able to delete inventory adjustment	\N
49fafe1b-9821-454b-af1a-453414f81565	update	Update Inventory Adjustment	inventory_adjustment	Can update inventory adjustment	\N
99229c94-2593-4229-8b08-a0157296de6e	update	mengubah dashboard	dashboard	Can update dashboard	\N
881ba0b6-f40c-4edd-b9ea-000ba5887bdc	create	menambahkan dashboard baru	dashboard	Can create a new dashboard	\N
67ae1544-e4e5-41b2-b48e-9bdfbd1b7641	create	Create New Inventory Adjustment	inventory_adjustment	Can create a new inventory adjustment	\N
1f434699-6414-4023-ba9a-2ef0e8b57a45	approve	Approve Inventory Adjustment	inventory_adjustment	Can approve new inventory adjustment	\N
6b90fcf7-63a9-4ae5-9efa-19e61bfa4838	cancel	Cancel Inventory Adjustment	inventory_adjustment	Can cancel inventory adjustment	\N
9540ba45-9c7b-4c91-9531-0d8917bab9c0	view	Open Inventory Opname Page	inventory_opname	Can open the inventory opname page	\N
0fa5e0f7-73ef-4922-b754-2b430b98686b	delete	Delete Inventory Opname	inventory_opname	Able to delete inventory opname	\N
ea60195a-03fc-4ab3-873d-a88e558e1255	update	Update Inventory Opname	inventory_opname	Can update inventory opname	\N
34363295-7492-43f3-a41d-c1f9dde8fb7e	create	Create New Inventory Opname	inventory_opname	Can create a new inventory opname	\N
7b0ff09d-1d80-438a-b817-4c6aa63cc7fb	approve	Approve Inventory Opname	inventory_opname	Can approve new inventory opname	\N
9ae0520f-b1f6-44f1-bb3d-40527491f199	review	Review Inventory Opname	inventory_opname	Can review inventory opname	\N
3db48591-9d27-4ec5-9298-e68d43d9b995	cancel	Cancel Inventory Opname	inventory_opname	Can cancel inventory opname	\N
41aa4d42-e7ad-47b5-84c4-a92bb9d10a67	view	View Inventory Movements Ledger	monitoring_inventory_movements	View inventory movements ledger	\N
e9405977-f46d-4580-9a91-4f8533f71503	all_access	DEV/IT	dev	Has access to all features	\N
b7777865-d2b5-4a3e-9b3f-c09e951551ab	view	buka halaman users management	user	Can open the user management page	\N
a7146a9e-af21-479c-bac8-44714c8d45d9	create	menambahkan user profile baru	user_profile	Can create a new user profile	\N
0a7c61d2-5659-4132-ad5c-a39c5721c188	view	Open Inventory Location Page	inventory_location	Can open the inventory location page	\N
44bb77be-de14-41ed-a803-ed07d75f67b3	delete	Delete Inventory Location	inventory_location	Able to delete inventory location	\N
255355aa-8a65-40de-ae99-c7ec9ff11d48	update	Update Inventory Location	inventory_location	Can update inventory location	\N
e3556966-2a76-49e5-a823-8151702531be	create	Create New Inventory Location	inventory_location	Can create a new inventory location	\N
1b420dd6-2b92-4648-a454-91f4fccfc9cf	view	Open Item detail Page	item_detail	Can open the item detail page	\N
15bce617-5282-4dc7-9510-36e24bf73c56	view	buka halaman form goods issues	goods_issue	Can open the goods issues page	\N
63aeba46-9bb0-418e-934f-e1fb1e7ecb81	view	View Inventory On Hand	monitoring_inventory_on_hand	View inventory on hand	\N
0cbcc661-7190-4273-895d-cd70e29bc672	delete	hapus goods issues	goods_issue	Able to delete goods issues	\N
231a6ff0-62b2-4a99-b446-364b277d1d0d	update	mengubah goods issues	goods_issue	Can update goods issues	\N
2c4c2a6c-0388-4554-b1bc-10efa7151498	create	menambahkan goods issues baru	goods_issue	Can create a new goods issue	\N
1d9457f1-bd4c-4e6d-8dd1-9ccac9db31cd	approve	approve goods issues	goods_issue	Can approve new goods issues	\N
8983ec84-793f-4393-aaf7-76621b46b5f7	view	View Inventory Location	monitoring_inventory_location	View inventory location	\N
67d1a8e9-cccf-4fc7-9d1f-d71823087230	view	View Inventory History	report_inventory_history	View inventory history	\N
7cc161ae-5841-4dcf-9063-571c8ff57e49	view	View PO Summary	report_po_summary	View PO summary	\N
277cfa70-b0a0-4345-ac26-eee0027e324e	view	buka halaman dashboard management	dashboard	Can open the dashboard management page	\N
1b2204b5-d007-48c2-8a34-7e6e35ddac15	delete	hapus dashboard	dashboard	Able to delete dashboard	\N
7d7cd8b9-99d5-40d3-8e1e-517395ce9dfd	receive	receive goods issues	goods_issue	Can receive goods issues	\N
d6745d5d-465c-4b86-8235-5ceaff012906	cancel	cancel goods issues	goods_issue	Can cancel goods issues	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
493c6e74-d309-4a85-8de5-862f9dbe82a7	e9405977-f46d-4580-9a91-4f8533f71503
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	abf78059-df84-48eb-8d04-e37c80106500
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	810bc639-65bc-41c8-bec5-8e0c5ec9a2c1
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	9e67720c-97e0-430e-884b-89377a3519eb
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	9a706a95-0f22-4e4c-93cd-566567a172b1
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	e391fcf7-0df9-473e-a11a-fb0c672e5223
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	a129920d-7dfb-4376-bf10-4ee3e3de6b5a
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	66ef1954-bbf5-4c2a-94dd-66e0828bce5f
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	d0ec6eba-0a8f-4f99-b91f-a087c7cd20c5
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	687f3fbe-a1f4-44de-8e79-1e811d0ee34f
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	bdb4c201-a8f8-47fb-800f-078eae49648a
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	a6d41266-ae96-4120-b3bf-cbd02b7f6b4f
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	0bd7f55a-79e2-46f9-9e3f-0986f376574d
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	e8c9679f-0c8a-4aed-a044-0078a694133f
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	82250154-6820-4eb1-9f4f-6d2b4b1b42b1
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	691aa7c8-6b92-4c62-ab37-01e1a0b1618f
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	9d68bd7e-7a7a-4e43-9e07-d232b2842213
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	ab746370-1ef7-4d8e-9826-22e0edc27161
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	dd36d8e8-420e-4b49-b8bc-37c188e6ba34
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	d63815df-fe49-4e94-bd32-b04bb642c009
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	23256f23-90c7-4d0a-91fc-af3b4ed30599
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	2f97535f-f9ec-4e20-b698-13a944e942e4
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	49fafe1b-9821-454b-af1a-453414f81565
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	67ae1544-e4e5-41b2-b48e-9bdfbd1b7641
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	9540ba45-9c7b-4c91-9531-0d8917bab9c0
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	ea60195a-03fc-4ab3-873d-a88e558e1255
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	34363295-7492-43f3-a41d-c1f9dde8fb7e
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	a7146a9e-af21-479c-bac8-44714c8d45d9
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	0a7c61d2-5659-4132-ad5c-a39c5721c188
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	255355aa-8a65-40de-ae99-c7ec9ff11d48
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	e3556966-2a76-49e5-a823-8151702531be
3351cd29-ae2e-4593-88ad-9499064a6413	3f58d759-bb58-4844-bfe9-d77a36c1dbb5
3351cd29-ae2e-4593-88ad-9499064a6413	a129920d-7dfb-4376-bf10-4ee3e3de6b5a
3351cd29-ae2e-4593-88ad-9499064a6413	66ef1954-bbf5-4c2a-94dd-66e0828bce5f
3351cd29-ae2e-4593-88ad-9499064a6413	9a706a95-0f22-4e4c-93cd-566567a172b1
3351cd29-ae2e-4593-88ad-9499064a6413	e391fcf7-0df9-473e-a11a-fb0c672e5223
3351cd29-ae2e-4593-88ad-9499064a6413	abf78059-df84-48eb-8d04-e37c80106500
3351cd29-ae2e-4593-88ad-9499064a6413	32b45501-36e2-4338-bb0f-7e60c43a6406
3351cd29-ae2e-4593-88ad-9499064a6413	d0ec6eba-0a8f-4f99-b91f-a087c7cd20c5
3351cd29-ae2e-4593-88ad-9499064a6413	dd63ce0c-de60-4914-90ef-e573e3959b99
3351cd29-ae2e-4593-88ad-9499064a6413	d06f0d95-7820-4cfc-8a6f-967d9b13b088
3351cd29-ae2e-4593-88ad-9499064a6413	2971d49e-2718-4a4b-9076-272990fab5d4
3351cd29-ae2e-4593-88ad-9499064a6413	687f3fbe-a1f4-44de-8e79-1e811d0ee34f
3351cd29-ae2e-4593-88ad-9499064a6413	bdb4c201-a8f8-47fb-800f-078eae49648a
3351cd29-ae2e-4593-88ad-9499064a6413	a6d41266-ae96-4120-b3bf-cbd02b7f6b4f
3351cd29-ae2e-4593-88ad-9499064a6413	9d68bd7e-7a7a-4e43-9e07-d232b2842213
3351cd29-ae2e-4593-88ad-9499064a6413	21344f03-5daf-4233-bb4b-ac983e3eead2
3351cd29-ae2e-4593-88ad-9499064a6413	72aeb7cd-d9ca-4473-9520-5e7dcc5e1808
3351cd29-ae2e-4593-88ad-9499064a6413	21eaaf06-e089-4ceb-9852-c53f15fdcc3a
3351cd29-ae2e-4593-88ad-9499064a6413	ab746370-1ef7-4d8e-9826-22e0edc27161
3351cd29-ae2e-4593-88ad-9499064a6413	7703ad68-1e1b-4ebb-bcb4-5cb0188ecf63
3351cd29-ae2e-4593-88ad-9499064a6413	dd36d8e8-420e-4b49-b8bc-37c188e6ba34
3351cd29-ae2e-4593-88ad-9499064a6413	6b7c91f5-3fb9-449c-9849-ea69c728d851
3351cd29-ae2e-4593-88ad-9499064a6413	6658da8c-5460-4be8-ad7b-f3ebef7194fe
3351cd29-ae2e-4593-88ad-9499064a6413	3e761f25-84d1-4956-8c97-050b450cd570
3351cd29-ae2e-4593-88ad-9499064a6413	e6ba7dc8-b1d8-4b1f-ac56-5dc939b58934
3351cd29-ae2e-4593-88ad-9499064a6413	64e3359e-db44-40e0-8a1d-8bed9dec9e7d
3351cd29-ae2e-4593-88ad-9499064a6413	41e4b577-30ac-44f5-86b2-87e34171c5b0
3351cd29-ae2e-4593-88ad-9499064a6413	34d13778-69d1-4f1b-8fab-6b533af8ac42
3351cd29-ae2e-4593-88ad-9499064a6413	0bd7f55a-79e2-46f9-9e3f-0986f376574d
3351cd29-ae2e-4593-88ad-9499064a6413	e8c9679f-0c8a-4aed-a044-0078a694133f
3351cd29-ae2e-4593-88ad-9499064a6413	82250154-6820-4eb1-9f4f-6d2b4b1b42b1
3351cd29-ae2e-4593-88ad-9499064a6413	cc4a16b0-9a50-446e-af0f-b8ce413fd4dc
3351cd29-ae2e-4593-88ad-9499064a6413	691aa7c8-6b92-4c62-ab37-01e1a0b1618f
3351cd29-ae2e-4593-88ad-9499064a6413	23256f23-90c7-4d0a-91fc-af3b4ed30599
3351cd29-ae2e-4593-88ad-9499064a6413	5a37e6fd-73a0-42b8-9c72-78910fa4fd12
3351cd29-ae2e-4593-88ad-9499064a6413	24e364fa-f169-4d4e-aa1f-515ebbc3d937
3351cd29-ae2e-4593-88ad-9499064a6413	d63815df-fe49-4e94-bd32-b04bb642c009
3351cd29-ae2e-4593-88ad-9499064a6413	9e67720c-97e0-430e-884b-89377a3519eb
3351cd29-ae2e-4593-88ad-9499064a6413	0a85c5d1-be0f-4343-b49c-9d862ec90e4a
3351cd29-ae2e-4593-88ad-9499064a6413	810bc639-65bc-41c8-bec5-8e0c5ec9a2c1
3351cd29-ae2e-4593-88ad-9499064a6413	1f434699-6414-4023-ba9a-2ef0e8b57a45
3351cd29-ae2e-4593-88ad-9499064a6413	6b90fcf7-63a9-4ae5-9efa-19e61bfa4838
3351cd29-ae2e-4593-88ad-9499064a6413	9540ba45-9c7b-4c91-9531-0d8917bab9c0
3351cd29-ae2e-4593-88ad-9499064a6413	b7777865-d2b5-4a3e-9b3f-c09e951551ab
3351cd29-ae2e-4593-88ad-9499064a6413	0fa5e0f7-73ef-4922-b754-2b430b98686b
3351cd29-ae2e-4593-88ad-9499064a6413	ea60195a-03fc-4ab3-873d-a88e558e1255
3351cd29-ae2e-4593-88ad-9499064a6413	34363295-7492-43f3-a41d-c1f9dde8fb7e
3351cd29-ae2e-4593-88ad-9499064a6413	7b0ff09d-1d80-438a-b817-4c6aa63cc7fb
3351cd29-ae2e-4593-88ad-9499064a6413	9ae0520f-b1f6-44f1-bb3d-40527491f199
3351cd29-ae2e-4593-88ad-9499064a6413	3db48591-9d27-4ec5-9298-e68d43d9b995
3351cd29-ae2e-4593-88ad-9499064a6413	41aa4d42-e7ad-47b5-84c4-a92bb9d10a67
3351cd29-ae2e-4593-88ad-9499064a6413	63aeba46-9bb0-418e-934f-e1fb1e7ecb81
3351cd29-ae2e-4593-88ad-9499064a6413	8983ec84-793f-4393-aaf7-76621b46b5f7
3351cd29-ae2e-4593-88ad-9499064a6413	67d1a8e9-cccf-4fc7-9d1f-d71823087230
3351cd29-ae2e-4593-88ad-9499064a6413	7cc161ae-5841-4dcf-9063-571c8ff57e49
3351cd29-ae2e-4593-88ad-9499064a6413	277cfa70-b0a0-4345-ac26-eee0027e324e
3351cd29-ae2e-4593-88ad-9499064a6413	1b2204b5-d007-48c2-8a34-7e6e35ddac15
3351cd29-ae2e-4593-88ad-9499064a6413	99229c94-2593-4229-8b08-a0157296de6e
3351cd29-ae2e-4593-88ad-9499064a6413	881ba0b6-f40c-4edd-b9ea-000ba5887bdc
3351cd29-ae2e-4593-88ad-9499064a6413	a7146a9e-af21-479c-bac8-44714c8d45d9
3351cd29-ae2e-4593-88ad-9499064a6413	0a7c61d2-5659-4132-ad5c-a39c5721c188
3351cd29-ae2e-4593-88ad-9499064a6413	44bb77be-de14-41ed-a803-ed07d75f67b3
3351cd29-ae2e-4593-88ad-9499064a6413	255355aa-8a65-40de-ae99-c7ec9ff11d48
3351cd29-ae2e-4593-88ad-9499064a6413	e3556966-2a76-49e5-a823-8151702531be
3351cd29-ae2e-4593-88ad-9499064a6413	15bce617-5282-4dc7-9510-36e24bf73c56
3351cd29-ae2e-4593-88ad-9499064a6413	0cbcc661-7190-4273-895d-cd70e29bc672
3351cd29-ae2e-4593-88ad-9499064a6413	231a6ff0-62b2-4a99-b446-364b277d1d0d
3351cd29-ae2e-4593-88ad-9499064a6413	2c4c2a6c-0388-4554-b1bc-10efa7151498
3351cd29-ae2e-4593-88ad-9499064a6413	1d9457f1-bd4c-4e6d-8dd1-9ccac9db31cd
3351cd29-ae2e-4593-88ad-9499064a6413	7d7cd8b9-99d5-40d3-8e1e-517395ce9dfd
3351cd29-ae2e-4593-88ad-9499064a6413	d6745d5d-465c-4b86-8235-5ceaff012906
3351cd29-ae2e-4593-88ad-9499064a6413	2f97535f-f9ec-4e20-b698-13a944e942e4
3351cd29-ae2e-4593-88ad-9499064a6413	fc75d232-b7c4-431f-974d-f4a59e38a3db
3351cd29-ae2e-4593-88ad-9499064a6413	49fafe1b-9821-454b-af1a-453414f81565
3351cd29-ae2e-4593-88ad-9499064a6413	67ae1544-e4e5-41b2-b48e-9bdfbd1b7641
3351cd29-ae2e-4593-88ad-9499064a6413	1b420dd6-2b92-4648-a454-91f4fccfc9cf
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, deleted_at) FROM stdin;
493c6e74-d309-4a85-8de5-862f9dbe82a7	dev	Developer role with full access	\N
3351cd29-ae2e-4593-88ad-9499064a6413	Supervisor	Admin staff responsible for approving transactions and reporting	\N
24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	Operator Staff	Persons who responsible for data entry	\N
\.


--
-- Data for Name: user_dashboard_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_dashboard_preferences (id, user_id, role_id, layout, updated_at, created_at) FROM stdin;
787c5b44-1ad2-4b80-a59f-2bd4988caf62	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	493c6e74-d309-4a85-8de5-862f9dbe82a7	{"rows": [{"columns": [{"width": 4, "component": "totalItems"}, {"width": 4, "component": "lowStock"}, {"width": 4, "component": "openPO"}]}]}	2025-12-06 08:22:41.158742	2025-12-06 08:22:41.14101
5dae2cee-e4fa-4106-aaa5-8d872d40722e	566f6344-474a-43b5-a400-dfde48a6d0e3	3351cd29-ae2e-4593-88ad-9499064a6413	{"rows": [{"columns": [{"width": 4, "component": "totalItems"}, {"width": 4, "component": "lowStock"}, {"width": 4, "component": "openPO"}]}, {"columns": [{"width": 12, "component": "recentGR"}]}, {"columns": [{"width": 12, "component": "recentGI"}]}]}	2025-12-08 15:32:57.607887	2025-12-08 15:32:57.578206
\.


--
-- Data for Name: user_departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_departments (user_id, department_id) FROM stdin;
a13f2ee7-a32c-433d-88c6-d463803dfd8c	a48ee66a-5401-46b3-bc57-c4d971f6b716
566f6344-474a-43b5-a400-dfde48a6d0e3	a48ee66a-5401-46b3-bc57-c4d971f6b716
c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	469caf61-5334-4d6a-bc69-0d766cd3ee6f
\.


--
-- Data for Name: user_layout_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_layout_preferences (id, user_id, role_id, layout, updated_at, created_at, default_page, default_new_tab, theme) FROM stdin;
70e04b2d-b5ea-46aa-9ce7-5c3dcd6c56bf	c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	493c6e74-d309-4a85-8de5-862f9dbe82a7	{"topPane": "tabbar", "leftPane": "VMenuBar", "rightPane": null, "bottomPane": null}	2025-12-06 08:21:42.336475	2025-12-06 08:21:42.336475	/pages/dashboard	\N	chrome-dark
65f1edb3-2ebf-473d-914e-df39c592c36b	566f6344-474a-43b5-a400-dfde48a6d0e3	3351cd29-ae2e-4593-88ad-9499064a6413	{"topPane": "tabbar", "leftPane": "VMenuBar", "rightPane": null, "bottomPane": null}	2025-12-09 08:35:17.789197	2025-12-08 15:31:57.818245	/pages/dashboard	/pages/list-launcher	dark
4ad119f7-8e46-4b10-a8cd-1dcb0ef9ad64	a13f2ee7-a32c-433d-88c6-d463803dfd8c	24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	{"topPane": "tabbar", "leftPane": null, "rightPane": "VMenuBar", "bottomPane": null}	2025-12-18 10:08:52.863764	2025-12-18 09:48:18.283151	/pages/list-launcher	/pages/boxy-launcher	light
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_permissions (user_id, permission_id, granted) FROM stdin;
\.


--
-- Data for Name: user_pinned_menus; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_pinned_menus (id, user_id, role_id, menu_id, pinned_at) FROM stdin;
2fcf85d2-fb76-4a4d-8f92-c5abe446561a	a13f2ee7-a32c-433d-88c6-d463803dfd8c	24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	3410b1bc-a222-4955-b4cc-342138b94483	2025-12-18 09:54:50.366345
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id, is_default) FROM stdin;
a13f2ee7-a32c-433d-88c6-d463803dfd8c	24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	t
566f6344-474a-43b5-a400-dfde48a6d0e3	3351cd29-ae2e-4593-88ad-9499064a6413	t
c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	493c6e74-d309-4a85-8de5-862f9dbe82a7	t
c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	f
c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	3351cd29-ae2e-4593-88ad-9499064a6413	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, username, email, password, is_active, created_at, updated_at, active_role_id, profile_photo, phone_number, address, deleted_at) FROM stdin;
a13f2ee7-a32c-433d-88c6-d463803dfd8c	Operator	operator	operator@inventory.com	$2b$10$PStx/MgUBzhyQC0obW7gMeEdQdRP1apoOB18N.q6/y4jB4RvlgZuW	t	2025-11-25 09:24:08.086398	2025-12-18 09:56:42.681215	24a86e85-7eb9-41cd-8d38-d93c1fa6cca1	\N	+62 9123 8123	Surabaya	\N
c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4	Developer	dev	dev@example.com	$2b$10$He8FMIrsadtF1CfDxYel..NxiKhYgXbJiHxKf3DloRfN/2Q5HtJfy	t	2025-10-07 10:30:48.411389	2025-12-18 09:14:52.720163	493c6e74-d309-4a85-8de5-862f9dbe82a7	\N	\N	\N	\N
566f6344-474a-43b5-a400-dfde48a6d0e3	Supervisor	supervisor	supervisor@inventory.com	$2b$10$h.acxzdBYW3bRQ/OcycYiuonmCA4U8xSXxFrQo2Y.yZYwBTnN0o3K	t	2025-11-27 10:15:21.525537	2025-11-27 13:03:45.130742	3351cd29-ae2e-4593-88ad-9499064a6413	\N	\N	\N	\N
aec24119-1f94-4582-83f4-b5b9692a3797	Administrator	admin	admin@inventory.com	$2b$10$SKsHeMJPs9E2JHnFv4B8NedMd5zIyM/iQAmq92E5DAj2VdEAUd/BO	t	2025-11-27 13:02:51.62174	2025-11-27 13:02:51.62174	\N	\N	\N	\N	2025-11-27 13:06:50.917963+07
\.


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
-- Name: idx_sm_adjustment_item_created; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_sm_adjustment_item_created ON inventory.stock_movements USING btree (item_id, created_at DESC) WHERE (movement_type = 'adjustment'::text);


--
-- Name: idx_sm_inout_item_created; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_sm_inout_item_created ON inventory.stock_movements USING btree (item_id, created_at DESC) WHERE (movement_type = ANY (ARRAY['inbound'::text, 'outbound'::text]));


--
-- Name: idx_sm_item_created; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_sm_item_created ON inventory.stock_movements USING btree (item_id, created_at DESC);


--
-- Name: idx_sm_type_created; Type: INDEX; Schema: inventory; Owner: -
--

CREATE INDEX idx_sm_type_created ON inventory.stock_movements USING btree (movement_type, created_at DESC);


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

\unrestrict CdvNkKZazDTgEh34lXN1jM9QeblMQJKHBPRjqrEYJb7IH1roEx93YegGL3O7etp

