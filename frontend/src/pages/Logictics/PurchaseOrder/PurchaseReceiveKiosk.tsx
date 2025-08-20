import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getPurchaseOrderById,
  searchPurchaseOrders,
  createPurchaseReceive,
} from "./purchaseOrder.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import SearchSelect from "@/components/SelectOptions/searchSelect";

const receiveItemSchema = z.object({
  item_id: z.string(),
  item_name: z.string(),
  ordered_qty: z.number(),
  received_qty: z.number().min(0),
  remaining_qty: z.number().min(0),
});

const receiveSchema = z.object({
  purchase_order_id: z.string(),
  receive_date: z.string(),
  note: z.string().optional(),
  items: z.array(receiveItemSchema).min(1),
});

type ReceiveFormValues = z.infer<typeof receiveSchema>;

export default function PurchaseReceiveKiosk() {
  const [loading, setLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const methods = useForm<ReceiveFormValues>({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      purchase_order_id: "",
      receive_date: new Date().toISOString().substring(0, 10),
      note: "",
      items: [],
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields } = useFieldArray({ control, name: "items" });

  // handler search PO
  const handleSearchPO = async (keyword: string) => {
    if (!keyword || keyword.length < 2) return [];
    try {
      const results = await searchPurchaseOrders(keyword); // array hasil
      return results.map((po: any) => ({
        id: po.id,
        name: `${po.order_number} - ${po.supplier_name}`,
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mencari purchase order");
      return [];
    }
  };

  // handler select PO
  const handleSelectPO = async (po: any) => {
    setSelectedPO(po);
    if (!po) {
      reset({
        purchase_order_id: "",
        receive_date: new Date().toISOString().substring(0, 10),
        note: "",
        items: [],
      });
      return;
    }
    try {
      const detail = await getPurchaseOrderById(po.id);
      reset({
        purchase_order_id: detail.id,
        receive_date: new Date().toISOString().substring(0, 10),
        note: "",
        items: detail.items.map((it: any) => ({
          item_id: it.item_id,
          item_name: it.item_name,
          ordered_qty: it.qty,
          received_qty: 0,
          remaining_qty: it.qty - (it.received_qty ?? 0),
        })),
      });
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal load detail PO");
    }
  };

  const onSubmit = async (data: ReceiveFormValues) => {
    try {
      setLoading(true);
      await createPurchaseReceive(data.purchase_order_id, {
        receive_date: data.receive_date,
        note: data.note,
        items: data.items.map((it) => ({
          item_id: it.item_id,
          qty: it.received_qty,
        })),
      });
      showSuccessToast("Barang berhasil diterima");
      setSelectedPO(null);
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan penerimaan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Receive Purchase Order</h1>

        {/* Search PO */}
        <div>
          <label className="block mb-1">Pilih Purchase Order</label>
          <SearchSelect
            value={selectedPO}
            onChange={(val) => handleSelectPO(val)}
            fetchOptions={handleSearchPO}
          />
        </div>

        {/* hanya tampil kalau sudah ada PO yang dipilih */}
        {selectedPO && (
          <>
            <div>
              <label>Tanggal Terima</label>
              <input
                type="date"
                className="w-full p-2 bg-gray-800 rounded"
                {...methods.register("receive_date")}
              />
            </div>

            <div>
              <label>Catatan</label>
              <textarea
                className="w-full p-2 bg-gray-800 rounded"
                {...methods.register("note")}
              />
            </div>

            <div>
              <table className="table-auto border border-gray-700 border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border border-gray-700 px-2 py-1">Item</th>
                    <th className="border border-gray-700 px-2 py-1">
                      Ordered
                    </th>
                    <th className="border border-gray-700 px-2 py-1">
                      Remaining
                    </th>
                    <th className="border border-gray-700 px-2 py-1">
                      Qty Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="border border-gray-700 px-2 py-1">
                        {field.item_name}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {field.ordered_qty}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {field.remaining_qty}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        <input
                          type="number"
                          className="w-20 p-2 border border-gray-600 bg-gray-800 rounded text-right"
                          {...methods.register(`items.${index}.received_qty`, {
                            valueAsNumber: true,
                            validate: (value) => {
                              if (value < 0) return "Qty tidak boleh negatif";
                              if (value > field.remaining_qty)
                                return `Maksimal ${field.remaining_qty}`;
                              return true;
                            },
                          })}
                          onBlur={(e) => {
                            let val = Number(e.target.value);
                            if (isNaN(val)) val = 0;
                            if (val < 0) val = 0;
                            if (val > field.remaining_qty)
                              val = field.remaining_qty;
                            methods.setValue(
                              `items.${index}.received_qty`,
                              val
                            );
                          }}
                        />
                        {methods.formState.errors.items?.[index]
                          ?.received_qty && (
                          <p className="text-red-500 text-xs">
                            {
                              methods.formState.errors.items[index]
                                ?.received_qty?.message as string
                            }
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        )}
      </form>
    </FormProvider>
  );
}
