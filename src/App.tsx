import React from "react";
import "./App.css";
import { SchedulePage } from "./pages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SchedulePage />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
