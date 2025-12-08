-- =======================================================
-- FUNCTION: seed_purchase_order_items()
-- Mengisi inventory.purchase_order_items
-- dengan 3–4 item random untuk setiap PO
-- =======================================================

CREATE OR REPLACE FUNCTION seed_purchase_order_items()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

TRUNCATE TABLE inventory.stock_locations RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory.suppliers RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory.items RESTART IDENTITY CASCADE;

-- =======================================================
-- SEEDER: inventory.stock_locations
-- =======================================================
INSERT INTO inventory.stock_locations (id, code, name, type, description)
VALUES
  ('4f1c5549-89d7-4335-981e-d042996c550f', 'MAIN', 'Main Warehouse', 'warehouse', 'Primary central storage'),
  ('821bf1e2-c94c-4c30-b71d-e8b7b6b740fd', 'STAGE', 'Staging Area', 'work-area', 'Temporary processing area'),
  ('9d2347cb-f9b7-4af2-842c-6cd1ff6e1a19', 'RET', 'Return Section', 'return', 'Location for returned products');

-- =======================================================
-- SEEDER: inventory.suppliers
-- =======================================================
INSERT INTO inventory.suppliers (id, name, contact, address)
VALUES
  ('c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'Prime Trading Supply', '0812-1234-5678', 'Jakarta'),
  ('34de6448-2a85-4adb-b878-8aa2208c1466', 'Reliable Commercial Partners', '0813-9876-1111', 'Bandung'),
  ('fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'Advance Growth Industries', '0812-8888-9999', 'Surabaya');

-- =======================================================
-- SEEDER: inventory.items
-- =======================================================
INSERT INTO inventory.items (id, sku, name, min_stock)
VALUES
  ('8c830d37-6be1-4a54-9e8b-d9fcdfafad16', 'ITM-0001', 'UTP Cable Cat6 100m', 5),
  ('64bf77fb-feba-4e4c-aa73-b323b62a0bc7', 'ITM-0002', 'Gigabit Switch 24 Port', 2),
  ('e4c08e3e-dfa1-4b4d-9b95-44528a3e9834', 'ITM-0003', 'Patch Panel 24 Port', 2),
  ('ef6e52ab-366e-4c51-8df0-c3ba4af2b2e8', 'ITM-0004', 'Router Mikrotik RB750', 1),
  ('88eb8906-5332-456d-aa94-4aacedbf198f', 'ITM-0005', 'Unifi U6 Lite Access Point', 4),
  ('d0f4aa5b-f9cf-4c9c-96b8-1e628a5fcb42', 'ITM-0006', 'Fiber Optic Cable SC-SC 20m', 5),
  ('e321c296-e580-4da3-89ba-99fe46477ae1', 'ITM-0007', 'TP-Link Media Converter', 4),
  ('7dbaf1e9-8bb3-49eb-bbb0-0e565a5bb615', 'ITM-0008', 'RJ45 Connector Cat6', 20),
  ('02540f95-d36f-4d7a-9eef-df9e84fe24ca', 'ITM-0009', 'IEC C13 Power Cable', 5),
  ('25e29ce2-3a40-4fd5-b38f-bd5f8a91e5bf', 'ITM-0010', 'APC UPS 1200VA', 1),
  ('d3c9af78-58bd-4649-a6da-19a07ae8844e', 'ITM-0011', 'USB to Serial Converter', 3),
  ('a880bcc5-d001-4ed1-9378-33e5f71bf3df', 'ITM-0012', '42U Server Rack', 1),
  ('3bd97ec2-83ff-4cf5-8bd0-c37ffaf1ae52', 'ITM-0013', 'Fiber Patch Panel 24 Port', 1),
  ('0624daad-fbd5-4957-a2a8-ddbc54fba5f5', 'ITM-0014', 'Thinkpad T14 Laptop', 1),
  ('1ca57f9e-362b-4a42-a2dc-eb7f3686a0ab', 'ITM-0015', 'Lenovo 24" Monitor', 2),
  ('db159f69-afbb-44bd-a04e-35880e5d408f', 'ITM-0016', 'Logitech K120 Keyboard', 5),
  ('e15f9138-0b4f-4da6-b620-f3af2cc24df6', 'ITM-0017', 'Logitech M100 Mouse', 5),
  ('807d0a7e-7446-4a11-baa5-5693abbd3c57', 'ITM-0018', '4-Port KVM Switch', 1),
  ('55843c0d-d32d-4024-897c-854069db0f81', 'ITM-0019', 'VGA to HDMI Converter', 3),
  ('fa77d16b-ba27-41d0-92ae-307788844f65', 'ITM-0020', 'Cat6 Patch Cable 1m', 20);


-- =======================================================
-- AUTO-SEEDER: inventory.purchase_orders (15 rows)
-- =======================================================

-- Bersihkan dulu tabelnya (opsional)
TRUNCATE TABLE inventory.purchase_order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory.purchase_orders RESTART IDENTITY CASCADE;

-- =======================================================
-- INSERT 15 PURCHASE ORDERS + RANDOM ITEMS (3-4 per PO)
-- =======================================================

INSERT INTO inventory.purchase_orders
  (id, supplier_id, status, notes, created_by, approved_by, approved_at)
VALUES
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Initial PO for restock', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Urgent order for client project', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Initial restock before deployment', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'General procurement batch 1', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'General procurement batch 2', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Quarterly stock replenishment', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Supplier gave discount items', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Preparation for new branch', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Replenish frequently used items', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Backup stock purchasing', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Spare parts procurement', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Network device replenishment', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Consumable materials restock', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Client request preparation', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Urgent supply request', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Restock before seasonal demand', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Supplier promotion event purchase', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Replacement for damaged items', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Client project initial materials', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Quarterly maintenance supplies', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Pre-order for upcoming deployment', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Restock commonly used components', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Preparation for year-end operations', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Replacement for low-quality batch', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Additional items requested by technician team', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Backup materials for remote sites', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'Testing materials for new product line', NULL, NULL, NULL),
  (gen_random_uuid(), 'c1a42114-aa3b-4e09-8bd1-778adc4a9ce3', 'draft', 'Restock due to unexpected demand', NULL, NULL, NULL),
  (gen_random_uuid(), '34de6448-2a85-4adb-b878-8aa2208c1466', 'draft', 'Procurement for customer urgent job', NULL, NULL, NULL),
  (gen_random_uuid(), 'fc0aaea9-ef65-4cc3-ae33-83d33fad6bd5', 'draft', 'General purchase round 3', NULL, NULL, NULL);

SELECT seed_purchase_order_items();
