import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "sonner";

console.log(`[ENV] Running in mode: ${import.meta.env.MODE}`);

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <Toaster richColors position="top-center" duration={3000} />
      <App />
    </AuthProvider>
  );
}
