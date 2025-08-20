import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";

export type GoodsReceiptItem = {
  id: string;
  item_id: string;
  sku: string;
  item_name: string;
  quantity: number;
  notes?: string;
};

export type GoodsReceipt = {
  id: string;
  receipt_number: string;
  receipt_date: string;
  supplier_id: string;
  supplier_name: string;
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
};

export const GoodsReceiptDetailPaneController = Controller<GoodsReceipt>();

export function GoodsReceiptDetailPane() {
  const state = GoodsReceiptDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const {
    receipt_number,
    receipt_date,
    supplier_name,
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
            <p className="text-sm text-gray-400">Supplier</p>
            <p className="text-white">{supplier_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Receipt Date</p>
            <p className="text-white">{receipt_date}</p>
          </div>
          {notes && (
            <div>
              <p className="text-sm text-gray-400">Notes</p>
              <p className="text-white">{notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Items</p>
            <table className="w-full text-sm border border-gray-700">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-gray-700">
                    <td className="px-2 py-1">{it.sku}</td>
                    <td className="px-2 py-1">{it.item_name}</td>
                    <td className="px-2 py-1 text-right">{it.quantity}</td>
                    <td className="px-2 py-1">{it.notes}</td>
                  </tr>
                ))}
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
                  <th className="px-2 py-1 text-left">SKU</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-right">Qty</th>
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
                    <td className="px-2 py-1">{sm.sku}</td>
                    <td className="px-2 py-1">{sm.item_name}</td>
                    <td className="px-2 py-1 text-right">{sm.qty}</td>
                    <td className="px-2 py-1 text-right">{sm.balance_after}</td>
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
