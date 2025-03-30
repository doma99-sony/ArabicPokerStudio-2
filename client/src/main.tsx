import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// Error handling for runtime errors
const handleError = (event: ErrorEvent) => {
  console.error("Runtime error:", event.error);
  event.preventDefault();
};

// Add global error handlers
window.addEventListener("error", handleError);

// Create and render the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
