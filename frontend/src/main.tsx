import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Route } from "wouter";

import { QueryClient, QueryClientProvider } from "react-query";
import { BaseUrlContextProvider } from "./context/useBaseUrlContext";
import { MediaListContextProvider } from "./context/useMediaListContext";

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
        <MediaListContextProvider>
          <Route path="/*" component={App} />
        </MediaListContextProvider>
      </BaseUrlContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
