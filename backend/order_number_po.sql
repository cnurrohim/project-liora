-- Tabel untuk counter per bulan
CREATE TABLE logistics.order_number_counters (
    year INT NOT NULL,
    month INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year, month)
);

CREATE OR REPLACE FUNCTION logistics.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month  INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO logistics.order_number_counters(year, month, counter)
    VALUES (v_year, v_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET counter = logistics.order_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format jadi PO-YYYY-MM-XXXX
    RETURN 'PO-'
        || v_year::text || '-'
        || lpad(v_month::text, 2, '0') || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION logistics.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := logistics.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_number
BEFORE INSERT ON logistics.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION logistics.set_order_number();


-- Counter untuk nomor goods receipt per bulan
CREATE TABLE logistics.receipt_number_counters (
    year INT NOT NULL,
    month INT NOT NULL,
    counter INT NOT NULL DEFAULT 0,
    PRIMARY KEY (year, month)
);

-- Function untuk generate nomor GR
CREATE OR REPLACE FUNCTION logistics.generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    v_year   INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month  INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_counter INT;
BEGIN
    -- Insert kalau belum ada, kalau ada langsung naikkan counter
    INSERT INTO logistics.receipt_number_counters(year, month, counter)
    VALUES (v_year, v_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET counter = logistics.receipt_number_counters.counter + 1
    RETURNING counter INTO v_counter;

    -- Format: GR-YYYY-MM-XXXX
    RETURN 'GR-'
        || v_year::text || '-'
        || lpad(v_month::text, 2, '0') || '-'
        || lpad(v_counter::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger function untuk set receipt_number otomatis
CREATE OR REPLACE FUNCTION logistics.set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := logistics.generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger di tabel goods_receipts
CREATE TRIGGER trg_set_receipt_number
BEFORE INSERT ON logistics.goods_receipts
FOR EACH ROW
EXECUTE FUNCTION logistics.set_receipt_number();
