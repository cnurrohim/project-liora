import { useEffect, useState } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getPurchaseOrderById } from "./purchaseOrder.api";
import { createPurchaseReceive } from "./purchaseOrder.api";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { searchLocation } from "@/api/search.api";
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
  location_id: z.string(),
  receive_date: z.string(),
  note: z.string().optional(),
  items: z.array(receiveItemSchema).min(1),
});

type Option = {
  id: string;
  name: string;
};

type ReceiveFormValues = z.infer<typeof receiveSchema>;

export default function PurchaseReceiveFormPage() {
  const { id } = useRouteParamsFromTab("/purchase-order/:id/receive");
  const [loading, setLoading] = useState(false);

  const methods = useForm<ReceiveFormValues>({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      purchase_order_id: id!,
      receive_date: new Date().toISOString().substring(0, 10),
      note: "",
      items: [],
    },
  });

  const [selectedLocation, setSelectedLocation] = useState<Option | null>(null);
  const { control, handleSubmit, reset } = methods;
  const { fields } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    const init = async () => {
      try {
        const po = await getPurchaseOrderById(id!);
        reset({
          purchase_order_id: po.id,
          location_id: po.location_id,
          receive_date: new Date().toISOString().substring(0, 10),
          note: "",
          items: po.items.map((it: any) => ({
            item_id: it.item_id,
            item_name: it.item_name,
            ordered_qty: it.qty,
            received_qty: 0,
            remaining_qty: it.qty - (it.received_qty ?? 0),
          })),
        });
      } catch (err: any) {
        console.log(err);
        showErrorToast("Failed loading purchase order");
      }
    };
    init();
  }, [id, reset]);

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
      showErrorToast("Failed to fetch inventory location");
      return [];
    }
  };

  const onSubmit = async (data: ReceiveFormValues) => {
    try {
      setLoading(true);

      await createPurchaseReceive(id!, {
        receive_date: data.receive_date,
        location_id: data.location_id,
        note: data.note,
        items: data.items.map((it) => ({
          item_id: it.item_id,
          qty: it.received_qty,
        })),
      });
      showSuccessToast("Item successfuly received");
    } catch (err: any) {
      showErrorToast(err.message || "Failed Saving receive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Receive Purchase Order</h1>

        <div>
          <label className="block text-[var(--content-text-muted)]">
            Tanggal Terima
          </label>
          <input
            type="date"
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...methods.register("receive_date")}
          />
        </div>

        <div>
          <label className="block text-[var(--content-text-muted)]">
            Lokasi Save
          </label>
          {/* Target Location */}

          <Controller
            name="location_id"
            control={control}
            render={({ field }) => (
              <SearchSelect
                value={selectedLocation}
                onChange={(val) => {
                  setSelectedLocation(val);
                  field.onChange(val ? val.id : "");
                }}
                fetchOptions={handleTargetLocation}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-[var(--content-text-muted)]">
            Catatan
          </label>
          <textarea
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...methods.register("note")}
          />
        </div>

        <div>
          <table className="table-auto border border-[var(--content-border)] border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Item
                </th>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Ordered
                </th>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Remaining
                </th>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Qty Received
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    <Controller
                      name={`items.${index}.item_id`}
                      control={control}
                      render={({ field }) => (
                        <SingleSelect
                          options={[]}
                          value={{
                            id: field.value,
                            name: fields[index]?.item_name || field.value,
                          }}
                          onChange={(val) => field.onChange(val?.id)}
                          placeholder="Item"
                          disabled
                        />
                      )}
                    />
                  </td>
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    {field.ordered_qty}
                  </td>
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    {field.remaining_qty}
                  </td>
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    <input
                      type="number"
                      className="w-20 p-2 border border-gray-600 bg-[var(--content-surface)] rounded text-right"
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
                        methods.setValue(`items.${index}.received_qty`, val);
                      }}
                    />
                    {methods.formState.errors.items?.[index]?.received_qty && (
                      <p className="text-[var(--danger)] text-xs">
                        {
                          methods.formState.errors.items[index]?.received_qty
                            ?.message as string
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
          className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer max-w-3/4"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </FormProvider>
  );
}
