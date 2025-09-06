// React hooks
import { useInitApp } from "./hooks/useInitApp";

// Components
import Loading from "./pages/Misc/Loading.tsx";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { Toaster } from "sonner";
import { LayoutRenderer } from "./components/LayoutRenderer.tsx";

export default function App() {
  const { isReady } = useInitApp();

  if (!isReady) return <Loading />;

  return (
    <div className="bg-gray-950 w-full h-screen flex flex-col text-[var(--text-primary)]">
      <Toaster
        position="top-center"
        toastOptions={{
          closeButton: true,
          classNames: {
            toast:
              "!bg-[var(--foreground)] !text-[var(--text-primary)] border !border-[var(--panel-border)]",
            title: "!text-[var(--text-primary)]",
            description: "!text-[var(--text-primary)]",
          },
        }}
      />
      <LayoutRenderer />
      <ConfirmationDialog />
    </div>
  );
}
