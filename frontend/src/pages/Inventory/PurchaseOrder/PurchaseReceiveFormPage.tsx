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
import { getStockLocations } from "../stockLocations/stockLocations.api";

const receiveItemSchema = z.object({
  item_id: z.string(),
  item_name: z.string(),
  ordered_qty: z.number(),
  received_qty: z.number().min(0),
  remaining_qty: z.number().min(0),
});

const receiveSchema = z.object({
  purchase_order_id: z.string(),
  location_id: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Stored Location is required"
          : "Invalid location",
    })
    .min(1, "Please choose stored location"),
  receive_date: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Received date is required" : "Not a date",
    })
    .min(1, "Please choose receive date"),
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
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<ReceiveFormValues>({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      purchase_order_id: id!,
      receive_date: new Date().toISOString().substring(0, 10),
      note: "",
      items: [],
    },
  });

  const [allLocations, setAllLocation] = useState<Option[]>([]);
  const { control, handleSubmit, reset } = methods;
  const { fields } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    const init = async () => {
      try {
        const locations = await getStockLocations();
        setAllLocation(locations.map((s: any) => ({ id: s.id, name: s.name })));

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
        showErrorToast("Failed fetching purchase order");
      }
    };
    init();
  }, [id, reset]);

  const onSubmit = async (data: ReceiveFormValues) => {
    try {
      setSaving(true);

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
      setSubmitted(true);
    } catch (err: any) {
      showErrorToast(err.message || "Failed Saving receive");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Receive Purchase Order</h1>

        <div>
          <label className="block text-(--content-text-muted)">
            Received Date
          </label>
          <input
            type="date"
            className="w-full p-2 bg-(--content-surface-hover) rounded"
            {...methods.register("receive_date")}
          />
        </div>

        <div>
          <label className="block text-(--content-text-muted)">
            Stored Location
          </label>
          {/* Target Location */}

          <Controller
            name="location_id"
            control={control}
            render={({ field }) => (
              <SingleSelect
                options={allLocations}
                value={
                  allLocations.find((opt) => opt.id === field.value) ?? null
                }
                onChange={(val) => field.onChange(val ? val.id : null)}
                placeholder="Choose Stored Location"
              />
            )}
          />

          {methods.formState.errors.location_id && (
            <p className="text-(--danger) text-xs mt-1">
              {methods.formState.errors.location_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-(--content-text-muted)">Notes</label>
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
                  <td className="border border-(--content-border) px-2 py-1">
                    {field.ordered_qty}
                  </td>
                  <td className="border border-(--content-border) px-2 py-1">
                    {field.remaining_qty}
                  </td>
                  <td className="border border-(--content-border) px-2 py-1">
                    <input
                      type="number"
                      className="w-20 p-2 border border-gray-600 bg-(--content-surface) rounded text-right"
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
                      <p className="text-(--danger) text-xs">
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
          disabled={saving || submitted}
          className="w-28 flex justify-center text-(--success-foreground) items-center px-4 py-2 bg-(--info) rounded hover:bg-(--info-hover) disabled:opacity-50 cursor-pointer max-w-3/4"
        >
          {saving ? "Saving..." : submitted ? "Saved" : "Save"}
        </button>
      </form>
    </FormProvider>
  );
}
