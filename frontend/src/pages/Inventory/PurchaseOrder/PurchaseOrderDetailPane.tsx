import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";

export type PurchaseOrderItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  qty: number;
  price: number;
};

export type PurchaseReceiveItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  qty: number;
};

export type PurchaseReceive = {
  id: string;
  receive_date: string;
  received_by: string;
  note?: string;
  stored_location: string;
  items: PurchaseReceiveItem[];
};

export type StockMovement = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  movement_type: string;
  adjustment_direction: string;
  qty: number;
  balance_after: number;
  reference_id: string;
  reference_type: string;
  note?: string;
  created_at: string;
  created_by: string;
  stored_location: string;
};

export type PurchaseOrderDetailData = {
  id: string;
  order_date: string;
  order_number: string;
  expected_date?: string;
  status: string;
  notes?: string;
  supplier_id: string;
  supplier_name: string;
  items: PurchaseOrderItem[];
  receives: PurchaseReceive[];
  stock_movements: StockMovement[];
};

export const PurchaseOrderDetailPaneController =
  Controller<PurchaseOrderDetailData>();

export function PurchaseOrderDetailPane() {
  const state = PurchaseOrderDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const {
    order_date,
    order_number,
    expected_date,
    status,
    notes,
    supplier_name,
    items,
    receives,
    stock_movements,
  } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={`PO #${order_number}`}
      onClose={PurchaseOrderDetailPaneController.close}
      widthClass="w-3/4"
    >
      <section className="space-y-6 mb-52">
        {/* Header */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-[var(--content-text-muted)]">Supplier</p>
            <p className="text-[var(--content-text)]">{supplier_name}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--content-text-muted)]">
              Order Date
            </p>
            <p className="text-[var(--content-text)]">{order_date}</p>
          </div>
          {expected_date && (
            <div>
              <p className="text-sm text-[var(--content-text-muted)]">
                Expected Date
              </p>
              <p className="text-[var(--content-text)]">{expected_date}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-[var(--content-text-muted)]">Status</p>
            <p className="text-[var(--content-text)] capitalize">{status}</p>
          </div>
          {notes && (
            <div>
              <p className="text-sm text-[var(--content-text-muted)]">Notes</p>
              <p className="text-[var(--content-text)]">{notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="text-[var(--content-text)]">
            <p className="text-sm  mb-2">Items</p>
            <table className="w-full text-sm border border-[var(--content-border)]">
              <thead className="bg-[var(--content-surface-hover)] text-[var(--content-text)]">
                <tr>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.id}
                    className="border-t border-[var(--content-border)]"
                  >
                    <td className="px-2 py-1">{it.sku}</td>
                    <td className="px-2 py-1">{it.item_name}</td>
                    <td className="px-2 py-1 text-right">{it.qty}</td>
                    <td className="px-2 py-1 text-right">{it.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Receives */}
        {receives.length > 0 && (
          <div className="text-[var(--content-text)]">
            <p className="text-sm text-[var(--content-text)] mb-2">Receives</p>
            {receives.map((r) => (
              <details
                key={r.id}
                className="bg-[var(--content-surface-inset)] rounded mb-2 "
              >
                <summary className="cursor-pointer px-4 py-2 font-semibold">
                  {r.receive_date} - {r.received_by} - {r.stored_location}
                </summary>
                <div className="p-4 text-sm space-y-2">
                  {r.note && (
                    <p className="text-[var(--content-text)]">{r.note}</p>
                  )}
                  <table className="w-full text-sm border border-[var(--content-border)]">
                    <thead className="bg-[var(--content-surface-hover)] text-[var(--content-text)]">
                      <tr>
                        <th className="px-2 py-1 text-left">SKU</th>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--content-surface)] text-[var(--content-text)]">
                      {r.items.map((ri) => (
                        <tr
                          key={ri.id}
                          className="border-t border-[var(--content-border)]"
                        >
                          <td className="px-2 py-1">{ri.sku}</td>
                          <td className="px-2 py-1">{ri.item_name}</td>
                          <td className="px-2 py-1 text-right">{ri.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}

        {stock_movements.length > 0 && (
          <div className="text-[var(--content-text)]">
            <p className="text-sm text-[var(--content-text)] mb-2">
              Inventory Movements
            </p>
            <table className="w-full text-sm border border-[var(--content-border)]">
              <thead className="bg-[var(--content-surface-hover)] text-[var(--content-text)]">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-right">Blc</th>
                  <th className="px-2 py-1 text-left">Note</th>
                  <th className="px-2 py-1 text-left">Stored</th>
                </tr>
              </thead>
              <tbody>
                {stock_movements.map((sm) => (
                  <tr
                    key={sm.id}
                    className="border-t border-[var(--content-border)]"
                  >
                    <td className="px-2 py-1">
                      {new Date(sm.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 py-1">{sm.sku}</td>
                    <td className="px-2 py-1">{sm.item_name}</td>
                    <td className="px-2 py-1 text-right">{sm.qty}</td>
                    <td className="px-2 py-1 text-right">{sm.balance_after}</td>
                    <td className="px-2 py-1">{sm.note}</td>
                    <td className="px-2 py-1">{sm.stored_location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DetailPane>
  );
}
