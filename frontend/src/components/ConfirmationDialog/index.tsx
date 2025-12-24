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
      <div className="bg-(--content-surface) text-(--content-text) p-6 rounded w-96 shadow-lg">
        <div className="mb-4">{state.message}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => ConfirmationDialogController.closeConfirmation()}
            className="px-4 py-2 text-(--content-text-muted) bg-(--content-surface-inset) hover:bg-(--content-surface-hover) rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              ConfirmationDialogController.closeConfirmation();
              state.onConfirm();
            }}
            className="px-4 py-2 text-(--info-foreground) bg-(--info) hover:bg-(--info-hover) rounded cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
