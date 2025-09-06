// src/routes/StockAdjustmentDetailPane.tsx
import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";
import { formatDate } from "@/utils/date";

export type StockAdjustmentItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  quantity_before: number;
  quantity_diff: number;
  location: string;
  notes?: string;
};

export type StockMovement = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  movement_type: string;
  adjustment_direction: string;
  qty: number;
  source_location: string;
  target_location: string;
  balance_after: number;
  reference_id: string;
  reference_type: string;
  note?: string;
  created_at: string;
  created_by: string;
};

export type StockAdjustment = {
  id: string;
  adjustment_number: string;
  adjustment_date: string;
  reason?: string;
  status: string;
  created_by: string;
  items: StockAdjustmentItem[];
  stock_movements: StockMovement[];
};

export const StockAdjustmentDetailPaneController =
  Controller<StockAdjustment>();

export function StockAdjustmentDetailPane() {
  const state = StockAdjustmentDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const {
    adjustment_number,
    adjustment_date,
    reason,
    status,
    created_by,
    items,
    stock_movements,
  } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={`Stock Adjustment #${adjustment_number}`}
      onClose={StockAdjustmentDetailPaneController.close}
      widthClass="w-3/4"
    >
      <section className="space-y-6 mb-52">
        {/* Header */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Adjustment Date</p>
            <p className="text-[var(--text-primary)]">
              {formatDate(adjustment_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Status</p>
            <p className="text-[var(--text-primary)] capitalize">{status}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Created By</p>
            <p className="text-[var(--text-primary)]">{created_by}</p>
          </div>
          {reason && (
            <div>
              <p className="text-sm text-[var(--text-muted)]">Reason</p>
              <p className="text-[var(--text-primary)]">{reason}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="text-[var(--text-primary)]">
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Adjusted Items
            </p>
            <table className="w-full text-sm border border-[var(--border)]">
              <thead className="bg-[var(--background)] text-[var(--text-primary)]">
                <tr>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-right">Qty Before</th>
                  <th className="px-2 py-1 text-right">Qty Diff</th>
                  <th className="px-2 py-1 text-left">Location</th>
                  <th className="px-2 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1">{it.sku}</td>
                    <td className="px-2 py-1">{it.item_name}</td>
                    <td className="px-2 py-1 text-right">
                      {it.quantity_before}
                    </td>
                    <td
                      className={`px-2 py-1 text-right ${
                        it.quantity_diff < 0
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {it.quantity_diff > 0
                        ? `+${it.quantity_diff}`
                        : it.quantity_diff}
                    </td>
                    <td className="px-2 py-1">{it.location}</td>
                    <td className="px-2 py-1">{it.notes ?? "-"}</td>
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
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-right">Location</th>
                  <th className="px-2 py-1 text-right">Balance</th>
                  <th className="px-2 py-1 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {stock_movements.map((sm) => (
                  <tr key={sm.id} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1">
                      {new Date(sm.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 py-1">
                      {sm.sku} - {sm.item_name}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {sm.target_location}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {sm.balance_after}
                      {sm.movement_type === "outbound" && (
                        <span className="ml-1 text-red-400">(-{sm.qty})</span>
                      )}
                      {sm.movement_type === "inbound" && (
                        <span className="ml-1 text-emerald-400">
                          (+{sm.qty})
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1">{sm.note ?? "-"}</td>
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
