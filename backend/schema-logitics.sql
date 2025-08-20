-- Lokasi penyimpanan
CREATE TABLE logistics.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,  -- contoh: "R1-A3"
  description TEXT
);

-- Supplier
CREATE TABLE logistics.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  address TEXT
);

-- Barang di gudang (metadata barang)
CREATE TABLE logistics.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_stock INT NOT NULL DEFAULT 0,
  location_id UUID REFERENCES logistics.locations(id),
  supplier_id UUID REFERENCES logistics.suppliers(id)
);

-- Ledger stok (semua pergerakan barang)
CREATE TABLE logistics.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES logistics.items(id),

  movement_type TEXT NOT NULL CHECK (
    movement_type IN ('inbound','outbound','adjustment')
  ),

  adjustment_direction TEXT NOT NULL CHECK (
    adjustment_direction IN ('increase','decrease')
  ),

  -- relasi antar kolom
  CONSTRAINT movement_direction_consistency CHECK (
    (movement_type = 'inbound'  AND adjustment_direction = 'increase') OR
    (movement_type = 'outbound' AND adjustment_direction = 'decrease') OR
    (movement_type = 'adjustment' AND adjustment_direction IN ('increase','decrease'))
  ),

  qty INT NOT NULL CHECK (qty > 0), -- selalu positif
  balance_after INT NOT NULL, -- saldo setelah transaksi

  reference_id UUID, -- bisa refer ke purchase_order, sales_order, dll
  reference_type TEXT NOT NULL CHECK (
    reference_type IN (
      'purchase_order',
      'sales_order',
      'sales_return',
      'purchase_return',
      'stock_opname',
      'manual_adjustment'
    )
  ),

  note TEXT,
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Hasil stock opname (audit fisik)
CREATE TABLE logistics.stock_opname (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES logistics.items(id),
  counted_qty INT NOT NULL,            -- jumlah hasil hitung fisik
  system_qty INT NOT NULL,             -- jumlah di sistem saat opname
  difference INT NOT NULL,             -- counted_qty - system_qty
  opname_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opname_by UUID REFERENCES public.users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Purchase Orders (Barang masuk dari supplier)
CREATE TABLE logistics.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES logistics.suppliers(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('draft','confirmed','received','cancelled')),
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE TABLE logistics.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES logistics.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES logistics.items(id),
  qty INT NOT NULL,
  price NUMERIC(18,2),
  received_qty INT DEFAULT 0
);

-- Sales Orders (Barang keluar ke customer)
CREATE TABLE logistics.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('draft','confirmed','shipped','cancelled')),
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE TABLE logistics.sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES logistics.sales_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES logistics.items(id),
  qty INT NOT NULL,
  price NUMERIC(18,2),
  shipped_qty INT DEFAULT 0
);

-- Sales Returns (Barang kembali dari customer)
CREATE TABLE logistics.sales_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number TEXT UNIQUE NOT NULL,
  sales_order_id UUID REFERENCES logistics.sales_orders(id),
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE TABLE logistics.sales_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_return_id UUID NOT NULL REFERENCES logistics.sales_returns(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES logistics.items(id),
  qty INT NOT NULL
);

-- Purchase Returns (Barang dikembalikan ke supplier)
CREATE TABLE logistics.purchase_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number TEXT UNIQUE NOT NULL,
  purchase_order_id UUID REFERENCES logistics.purchase_orders(id),
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE TABLE logistics.purchase_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_return_id UUID NOT NULL REFERENCES logistics.purchase_returns(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES logistics.items(id),
  qty INT NOT NULL
);

ALTER TABLE logistics.purchase_orders
ADD COLUMN expected_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day');

-- Lokasi penyimpanan
COMMENT ON TABLE logistics.locations IS 'Tabel menyimpan daftar lokasi penyimpanan di gudang';
COMMENT ON COLUMN logistics.locations.code IS 'Kode unik lokasi, contoh: R1-A3';
COMMENT ON COLUMN logistics.locations.description IS 'Deskripsi lokasi';

-- Supplier
COMMENT ON TABLE logistics.suppliers IS 'Tabel menyimpan informasi supplier';
COMMENT ON COLUMN logistics.suppliers.name IS 'Nama supplier';
COMMENT ON COLUMN logistics.suppliers.contact IS 'Kontak supplier';
COMMENT ON COLUMN logistics.suppliers.address IS 'Alamat supplier';

-- Barang di gudang (metadata barang)
COMMENT ON TABLE logistics.items IS 'Tabel menyimpan informasi barang di gudang';
COMMENT ON COLUMN logistics.items.sku IS 'Kode unik barang (SKU)';
COMMENT ON COLUMN logistics.items.name IS 'Nama barang';
COMMENT ON COLUMN logistics.items.min_stock IS 'Minimal stok untuk trigger reorder';
COMMENT ON COLUMN logistics.items.location_id IS 'Referensi ke lokasi penyimpanan';
COMMENT ON COLUMN logistics.items.supplier_id IS 'Referensi ke supplier barang';

-- Ledger stok (semua pergerakan barang)
COMMENT ON TABLE logistics.stock_movements IS 'Ledger stok: semua pergerakan barang masuk, keluar, dan penyesuaian';
COMMENT ON COLUMN logistics.stock_movements.movement_type IS 'Tipe pergerakan: inbound, outbound, atau adjustment';
COMMENT ON COLUMN logistics.stock_movements.adjustment_direction IS 'Arah penyesuaian: increase atau decrease';
COMMENT ON COLUMN logistics.stock_movements.qty IS 'Jumlah barang, selalu positif';
COMMENT ON COLUMN logistics.stock_movements.balance_after IS 'Saldo stok setelah transaksi';
COMMENT ON COLUMN logistics.stock_movements.reference_id IS 'Referensi ke tabel terkait (PO, SO, stock_opname, dsb)';
COMMENT ON COLUMN logistics.stock_movements.reference_type IS 'Tipe referensi, menentukan tabel asal';
COMMENT ON COLUMN logistics.stock_movements.note IS 'Catatan tambahan';
COMMENT ON COLUMN logistics.stock_movements.created_by IS 'User yang membuat transaksi';

-- Hasil stock opname
COMMENT ON TABLE logistics.stock_opname IS 'Tabel hasil audit fisik stok';
COMMENT ON COLUMN logistics.stock_opname.counted_qty IS 'Jumlah fisik hasil hitung';
COMMENT ON COLUMN logistics.stock_opname.system_qty IS 'Jumlah di sistem saat opname';
COMMENT ON COLUMN logistics.stock_opname.difference IS 'Selisih counted_qty - system_qty';
COMMENT ON COLUMN logistics.stock_opname.opname_by IS 'User yang melakukan stock opname';
COMMENT ON COLUMN logistics.stock_opname.note IS 'Catatan tambahan';

-- Purchase Orders
COMMENT ON TABLE logistics.purchase_orders IS 'Tabel purchase order barang masuk dari supplier';
COMMENT ON COLUMN logistics.purchase_orders.order_number IS 'Nomor unik PO';
COMMENT ON COLUMN logistics.purchase_orders.supplier_id IS 'Supplier terkait';
COMMENT ON COLUMN logistics.purchase_orders.status IS 'Status PO: draft, confirmed, received, cancelled';
COMMENT ON COLUMN logistics.purchase_orders.created_by IS 'User yang membuat PO';

COMMENT ON TABLE logistics.purchase_order_items IS 'Daftar item di setiap PO';
COMMENT ON COLUMN logistics.purchase_order_items.qty IS 'Jumlah barang dipesan';
COMMENT ON COLUMN logistics.purchase_order_items.received_qty IS 'Jumlah barang yang sudah diterima';

-- Sales Orders
COMMENT ON TABLE logistics.sales_orders IS 'Tabel sales order barang keluar ke customer';
COMMENT ON COLUMN logistics.sales_orders.customer_name IS 'Nama customer';
COMMENT ON COLUMN logistics.sales_orders.status IS 'Status SO: draft, confirmed, shipped, cancelled';

COMMENT ON TABLE logistics.sales_order_items IS 'Daftar item di setiap sales order';
COMMENT ON COLUMN logistics.sales_order_items.qty IS 'Jumlah barang dipesan';
COMMENT ON COLUMN logistics.sales_order_items.shipped_qty IS 'Jumlah barang yang sudah dikirim';

-- Sales Returns
COMMENT ON TABLE logistics.sales_returns IS 'Tabel retur barang dari customer';
COMMENT ON COLUMN logistics.sales_returns.return_number IS 'Nomor unik retur';
COMMENT ON COLUMN logistics.sales_returns.sales_order_id IS 'Referensi ke SO asal';
COMMENT ON COLUMN logistics.sales_returns.reason IS 'Alasan retur';

COMMENT ON TABLE logistics.sales_return_items IS 'Daftar item di setiap retur sales';
COMMENT ON COLUMN logistics.sales_return_items.qty IS 'Jumlah barang yang dikembalikan';

-- Purchase Returns
COMMENT ON TABLE logistics.purchase_returns IS 'Tabel retur barang ke supplier';
COMMENT ON COLUMN logistics.purchase_returns.return_number IS 'Nomor unik retur';
COMMENT ON COLUMN logistics.purchase_returns.purchase_order_id IS 'Referensi ke PO asal';
COMMENT ON COLUMN logistics.purchase_returns.reason IS 'Alasan retur';

COMMENT ON TABLE logistics.purchase_return_items IS 'Daftar item di setiap retur purchase';
COMMENT ON COLUMN logistics.purchase_return_items.qty IS 'Jumlah barang yang dikembalikan';
