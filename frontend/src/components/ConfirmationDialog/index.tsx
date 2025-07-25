import { useSyncExternalStore } from "react";
import { ConfirmationDialogController } from "./controller";

export default function ConfirmationDialog() {
  const state = useSyncExternalStore(
    ConfirmationDialogController.subscribe,
    ConfirmationDialogController.getState
  );

  if (!state.visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-gray-800 text-white p-6 rounded w-96 shadow-lg">
        <div className="mb-4">{state.message}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => ConfirmationDialogController.closeConfirmation()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => {
              ConfirmationDialogController.closeConfirmation();
              state.onConfirm();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded cursor-pointer"
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}
