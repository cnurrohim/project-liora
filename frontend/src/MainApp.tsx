// React hooks
import { useInitApp } from "./hooks/useInitApp";

// Components
import Loading from "./pages/Loading";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { Toaster } from "sonner";
import { LayoutRenderer } from "./components/LayoutRenderer.tsx";

export default function App() {
  const { isReady } = useInitApp();

  if (!isReady) return <Loading />;

  return (
    <div className="bg-gray-950 w-full h-screen flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "!bg-gray-900 !text-white !border !border-gray-700",
            title: "!text-white",
            description: "!text-gray-400",
          },
        }}
      />
      <LayoutRenderer />
      <ConfirmationDialog />
    </div>
  );
}
