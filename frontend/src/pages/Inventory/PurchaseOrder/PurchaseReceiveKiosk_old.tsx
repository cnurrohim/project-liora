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
import { searchLocation } from "@/api/search.api";

const receiveItemSchema = z.object({
  item_id: z.string(),
  item_name: z.string(),
  ordered_qty: z.number(),
  received_qty: z.number().min(0),
  remaining_qty: z.number().min(0),
});

const receiveSchema = z.object({
  purchase_order_id: z.string(),
  location_id: z.string(),
  receive_date: z.string(),
  note: z.string().optional(),
  items: z.array(receiveItemSchema).min(1),
});

type ReceiveFormValues = z.infer<typeof receiveSchema>;

export default function PurchaseReceiveKiosk() {
  const [loading, setLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

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
      showErrorToast("Failed to fetch purchase order");
      return [];
    }
  };

  // handler select PO
  const handleSelectPO = async (po: any) => {
    setSelectedPO(po);
    if (!po) {
      reset({
        purchase_order_id: "",
        location_id: "",
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
        location_id: po.location_id,
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
      showErrorToast("failed to load purchase order");
    }
  };

  const handleTargetLocation = async (keyword: string) => {
    if (!keyword || keyword.length < 2) return [];
    try {
      const results = await searchLocation(keyword);
      return results.map((location: any) => ({
        id: location.id,
        name: `${location.code}-${location.name}`,
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("failed to fetch inventory location");
      return [];
    }
  };

  const onSubmit = async (data: ReceiveFormValues) => {
    try {
      setLoading(true);
      await createPurchaseReceive(data.purchase_order_id, {
        receive_date: data.receive_date,
        location_id: data.location_id,
        note: data.note,
        items: data.items.map((it) => ({
          item_id: it.item_id,
          qty: it.received_qty,
        })),
      });
      showSuccessToast("Item received successfuly");
      setSelectedPO(null);
      setSelectedLocation(null);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to received item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-3/4 mx-auto p-4"
      >
        <h1 className="text-xl font-bold">Receive Purchase Order</h1>

        {/* Search PO */}
        <div>
          <SearchSelect
            placeholder="Enter Purchase Order Number"
            value={selectedPO}
            onChange={(val) => handleSelectPO(val)}
            fetchOptions={handleSearchPO}
          />
        </div>

        {/* hanya tampil kalau sudah ada PO yang dipilih */}
        {selectedPO && (
          <>
            <div>
              <label>Receive Date</label>
              <input
                type="date"
                className="w-full p-2 bg-(--content-surface-hover) rounded"
                {...methods.register("receive_date")}
              />

              {methods.formState.errors.receive_date && (
                <p className="text-(--danger) text-xs mt-1">
                  {methods.formState.errors.receive_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-(--content-text-muted)">
                Stored Location
              </label>
              {/* Target Location */}
              <SearchSelect
                value={selectedLocation}
                onChange={(val) => {
                  setSelectedLocation(val);
                  methods.setValue("location_id", val?.id || ""); // inject ke form
                }}
                fetchOptions={handleTargetLocation}
              />

              {methods.formState.errors.location_id && (
                <p className="text-(--danger) text-xs mt-1">
                  {methods.formState.errors.location_id.message}
                </p>
              )}
            </div>

            <div>
              <label>Catatan</label>
              <textarea
                className="w-full p-2 bg-(--content-surface-hover) rounded"
                {...methods.register("note")}
              />
            </div>

            <div>
              <table className="table-auto border border-(--content-border) border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border border-(--content-border) px-2 py-1">
                      Item
                    </th>
                    <th className="border border-(--content-border) px-2 py-1">
                      Ordered
                    </th>
                    <th className="border border-(--content-border) px-2 py-1">
                      Remaining
                    </th>
                    <th className="border border-(--content-border) px-2 py-1">
                      Qty Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="border border-(--content-border) px-2 py-1">
                        {field.item_name}
                      </td>
                      <td className="border border-(--content-border) px-2 py-1 text-right">
                        {field.ordered_qty}
                      </td>
                      <td className="border border-(--content-border) px-2 py-1 text-right">
                        {field.remaining_qty}
                      </td>
                      <td className="w-40 border border-(--content-border) px-2 py-1">
                        <input
                          type="number"
                          className="w-40 p-2 border border-(--content-border) bg-(--content-surface-hover) rounded text-right"
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
                          <p className="text-(--danger) text-xs">
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
              {methods.formState.errors.items?.message && (
                <p className="text-(--danger) text-xs mt-2">
                  {methods.formState.errors.items.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-28 flex justify-center text-(--success-foreground) items-center px-4 py-2 bg-(--info) rounded hover:bg-(--info-hover) disabled:opacity-50 cursor-pointer max-w-3/4"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </form>
    </FormProvider>
  );
}
