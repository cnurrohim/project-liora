import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";

export type GoodsIssueItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  qty: number;
  source_location: string;
  target_location: string;
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

export type GoodsIssue = {
  id: string;
  issue_number: string;
  issue_date: string;
  notes?: string;
  created_by: string;
  items: GoodsIssueItem[];
  stock_movements: StockMovement[];
};

export const GoodsIssueDetailPaneController = Controller<GoodsIssue>();

export function GoodsIssueDetailPane() {
  const state = GoodsIssueDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const {
    issue_number,
    issue_date,
    notes,
    created_by,
    items,
    stock_movements,
  } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={`Goods Issue #${issue_number}`}
      onClose={GoodsIssueDetailPaneController.close}
      widthClass="w-3/4"
    >
      <section className="space-y-6 mb-52">
        {/* Header */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Issue Date</p>
            <p className="text-[var(--text-primary)]">{issue_date}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Created By</p>
            <p className="text-[var(--text-primary)]">{created_by}</p>
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
              <thead className="bg-[var(--background)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-left">Source</th>
                  <th className="px-2 py-1 text-left">Target</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1">{it.sku}</td>
                    <td className="px-2 py-1">{it.item_name}</td>
                    <td className="px-2 py-1 text-right">{it.qty}</td>
                    <td className="px-2 py-1">{it.source_location}</td>
                    <td className="px-2 py-1">{it.target_location}</td>
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
              <thead className="bg-[var(--background)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-right">Stk Loc</th>
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
                      {sm.movement_type == "inbound"
                        ? sm.target_location
                        : sm.source_location}
                    </td>
                    <td className="px-2 py-1 text-right align-top">
                      {sm.balance_after}
                      {sm.movement_type == "outbound" && (
                        <span className="ml-1 text-red-400">(-{sm.qty})</span>
                      )}
                      {sm.movement_type == "inbound" && (
                        <span className="ml-1 text-emerald-400">
                          (+{sm.qty})
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-1">{sm.note}</td>
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
