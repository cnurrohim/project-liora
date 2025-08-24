-- Tabel untuk counter per bulan
CREATE TABLE inventory.order_number_counters (
    year INT NOT NULL,
    month INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year, month)
);

CREATE OR REPLACE FUNCTION inventory.generate_order_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION inventory.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := inventory.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_number
BEFORE INSERT ON inventory.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION inventory.set_order_number();

--- #### #### ---

-- Counter untuk nomor goods receipt per bulan
CREATE TABLE inventory.receipt_number_counters (
    year INT NOT NULL,
    month INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year, month)
);

-- Function untuk generate nomor GR
CREATE OR REPLACE FUNCTION inventory.generate_receipt_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger function untuk set receipt_number otomatis
CREATE OR REPLACE FUNCTION inventory.set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := inventory.generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger di tabel goods_receipts
CREATE TRIGGER trg_set_receipt_number
BEFORE INSERT ON inventory.goods_receipts
FOR EACH ROW
EXECUTE FUNCTION inventory.set_receipt_number();

--- #### #### ---

-- Counter untuk nomor goods issue per bulan
CREATE TABLE inventory.issue_number_counters (
    year INT NOT NULL,
    month INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year, month)
);

-- Function untuk generate nomor Issue
CREATE OR REPLACE FUNCTION inventory.generate_issue_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger function untuk set issue_number otomatis
CREATE OR REPLACE FUNCTION inventory.set_issue_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.issue_number IS NULL THEN
        NEW.issue_number := inventory.generate_issue_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger di tabel goods_issues
CREATE TRIGGER trg_set_issue_number
BEFORE INSERT ON inventory.goods_issues
FOR EACH ROW
EXECUTE FUNCTION inventory.set_issue_number();

-- Counter untuk nomor adjustment per bulan
CREATE TABLE inventory.adjustment_number_counters (
    year INT NOT NULL,
    month INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year, month)
);

-- Function untuk generate nomor Adjustment
CREATE OR REPLACE FUNCTION inventory.generate_adjustment_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger function untuk set adjustment_number otomatis
CREATE OR REPLACE FUNCTION inventory.set_adjustment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.adjustment_number IS NULL THEN
        NEW.adjustment_number := inventory.generate_adjustment_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger di tabel adjustments
CREATE TRIGGER trg_set_adjustment_number
BEFORE INSERT ON inventory.stock_adjustments
FOR EACH ROW
EXECUTE FUNCTION inventory.set_adjustment_number();



---- ################################# ----

-- Counter untuk nomor stock opname per tahun
CREATE TABLE inventory.opname_number_counters (
    year INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year)
);

-- Function untuk generate nomor Opname
CREATE OR REPLACE FUNCTION inventory.generate_opname_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger function untuk set opname_number otomatis
CREATE OR REPLACE FUNCTION inventory.set_opname_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.opname_number IS NULL THEN
        NEW.opname_number := inventory.generate_opname_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger di tabel stock_opnames
CREATE TRIGGER trg_set_opname_number
BEFORE INSERT ON inventory.stock_opnames
FOR EACH ROW
EXECUTE FUNCTION inventory.set_opname_number();
