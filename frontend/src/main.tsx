import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Route } from "wouter";

import { QueryClient, QueryClientProvider } from "react-query";
import { BaseUrlContextProvider } from "./context/useBaseUrlContext";

const mainQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={mainQueryClient}>
      <BaseUrlContextProvider>
        <Route path="/*" component={App} />
      </BaseUrlContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
