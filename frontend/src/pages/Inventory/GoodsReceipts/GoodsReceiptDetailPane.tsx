import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";

export type GoodsReceiptItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  qty: number;
  notes?: string;
};

export type GoodsReceipt = {
  id: string;
  receipt_number: string;
  receipt_date: string;
  supplier_id: string;
  supplier_name: string;
  stored_location: string;
  notes?: string;
  created_by: string;
  items: GoodsReceiptItem[];
  stock_movements: StockMovement[];
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

export const GoodsReceiptDetailPaneController = Controller<GoodsReceipt>();

export function GoodsReceiptDetailPane() {
  const state = GoodsReceiptDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const {
    receipt_number,
    receipt_date,
    supplier_name,
    stored_location,
    notes,
    items,
    stock_movements,
  } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={`Goods Receipt #${receipt_number}`}
      onClose={GoodsReceiptDetailPaneController.close}
      widthClass="w-3/4"
    >
      <section className="space-y-6 mb-52">
        {/* Header */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Supplier</p>
            <p className="text-[var(--text-primary)]">{supplier_name}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Receipt Date</p>
            <p className="text-[var(--text-primary)]">{receipt_date}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Stored In</p>
            <p className="text-[var(--text-primary)]">{stored_location}</p>
          </div>
          {notes && (
            <div>
              <p className="text-sm text-[var(--text-muted)]">Notes</p>
              <p className="text-[var(--text-primary)]">{notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="text-[var(--text-primary)]">
            <p className="text-sm text-[var(--text-muted)] mb-2">Items</p>
            <table className="w-full text-sm border border-[var(--border)]">
              <thead className="bg-[var(--background)] text-[var(--text-primary)]">
                <tr>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  {/* <th className="px-2 py-1 text-left">Notes</th> */}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1">{it.sku}</td>
                    <td className="px-2 py-1">{it.item_name}</td>
                    <td className="px-2 py-1 text-right">{it.qty}</td>
                    {/* <td className="px-2 py-1">{it.notes}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock Movements */}
        {stock_movements.length > 0 && (
          <div className="text-[var(--text-primary)]">
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Stock Movements
            </p>
            <table className="w-full text-sm border border-[var(--border)]">
              <thead className="bg-[var(--background)] text-[var(--text-primary)]">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-right">Balance</th>
                  <th className="px-2 py-1 text-left">Note</th>
                  <th className="px-2 py-1 text-left">Stored</th>
                </tr>
              </thead>
              <tbody>
                {stock_movements.map((sm) => (
                  <tr key={sm.id} className="border-t border-[var(--border)]">
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
