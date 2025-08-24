import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";
import { formatDate } from "@/utils/date";

export type StockOpnameItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  quantity_system: number;
  quantity_counted: number;
};

export type StockMovement = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  movement_type: string;
  adjustment_direction: string;
  qty: number;
  source_location?: string;
  target_location?: string;
  balance_after: number;
  reference_id: string;
  reference_type: string;
  note?: string;
  created_at: string;
  created_by: string;
};

export type StockOpname = {
  id: string;
  opname_number: string;
  opname_date: string;
  status: string;
  notes?: string;
  location?: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  reviewed_at: string;
  reviewed_by: string;
  canceled_at: string;
  canceled_by: string;
  finalized_at: string;
  finalized_by: string;
  review_note: string;
  items: StockOpnameItem[];
  stock_movements: StockMovement[];
};

export const StockOpnameDetailPaneController = Controller<StockOpname>();

export function StockOpnameDetailPane() {
  const state = StockOpnameDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const {
    opname_number,
    opname_date,
    status,
    notes,
    created_by,
    updated_at,
    updated_by,
    reviewed_at,
    reviewed_by,
    canceled_at,
    canceled_by,
    finalized_at,
    finalized_by,
    review_note,
    items,
    stock_movements,
    location,
  } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={`Stock Opname #${opname_number}`}
      onClose={StockOpnameDetailPaneController.close}
      widthClass="w-3/4"
    >
      <section className="space-y-6 mb-52">
        {/* Header */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-400">Opname Location</p>
            <p className="text-white">{location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Opname Date</p>
            <p className="text-white">{formatDate(opname_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Created By</p>
            <p className="text-white">{created_by}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Status</p>
            <p className="text-white">{status}</p>
          </div>
          {!updated_at && (
            <div>
              <p className="text-sm text-gray-400">Note</p>
              <p className="text-white">{notes}</p>
            </div>
          )}
        </div>

        {status !== "draft" && (
          <table className="w-full text-sm border border-gray-700 mb-4">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-2 py-1 text-left">Progress</th>
                <th className="px-2 py-1 text-left">Note</th>
                <th className="px-2 py-1 text-left">By</th>
                <th className="px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {updated_at && (
                <tr>
                  <td className="px-2 py-1">Updated</td>
                  <td className="px-2 py-1">{notes}</td>
                  <td className="px-2 py-1">{updated_by}</td>
                  <td className="px-2 py-1">{formatDate(updated_at)}</td>
                </tr>
              )}

              {reviewed_at && (
                <tr>
                  <td className="px-2 py-1">Reviewed</td>
                  <td className="px-2 py-1">{review_note ?? "-"}</td>
                  <td className="px-2 py-1">{reviewed_by}</td>
                  <td className="px-2 py-1">{formatDate(reviewed_at)}</td>
                </tr>
              )}
              {finalized_at && (
                <tr>
                  <td className="px-2 py-1">Finalized</td>
                  <td className="px-2 py-1">-</td>
                  <td className="px-2 py-1">{finalized_by}</td>
                  <td className="px-2 py-1">{formatDate(finalized_at)}</td>
                </tr>
              )}
              {canceled_at && (
                <tr>
                  <td className="px-2 py-1">Canceled</td>
                  <td className="px-2 py-1">-</td>
                  <td className="px-2 py-1">{canceled_by}</td>
                  <td className="px-2 py-1">{formatDate(canceled_at)}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Opname Items</p>
            <table className="w-full text-sm border border-gray-700">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-right">System Qty</th>
                  <th className="px-2 py-1 text-right">Counted Qty</th>
                  <th className="px-2 py-1 text-right">Diff</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const diff = it.quantity_counted - it.quantity_system;
                  return (
                    <tr key={it.id} className="border-t border-gray-700">
                      <td className="px-2 py-1">{it.sku}</td>
                      <td className="px-2 py-1">{it.item_name}</td>
                      <td className="px-2 py-1 text-right">
                        {it.quantity_system}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {it.quantity_counted}
                      </td>
                      <td
                        className={`px-2 py-1 text-right ${
                          diff < 0
                            ? "text-red-400"
                            : diff > 0
                            ? "text-emerald-400"
                            : ""
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock Movements */}
        {stock_movements.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Stock Movements</p>
            <table className="w-full text-sm border border-gray-700">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-left">Location</th>
                  <th className="px-2 py-1 text-right">Balance</th>
                  <th className="px-2 py-1 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {stock_movements.map((sm) => (
                  <tr key={sm.id} className="border-t border-gray-700">
                    <td className="px-2 py-1">
                      {new Date(sm.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 py-1">
                      {sm.sku} - {sm.item_name}
                    </td>
                    <td className="px-2 py-1">{sm.target_location ?? "-"}</td>
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
