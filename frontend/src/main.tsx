import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { OceanToastProvider } from "./components/ui/ocean-toast.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <OceanToastProvider>
    <App />
  </OceanToastProvider>
);
