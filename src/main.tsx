import { createTheme, ThemeProvider } from "@mui/material";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { Analytics } from "@vercel/analytics/react";
import "@mysten/dapp-kit/dist/index.css";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { StyledSnackbarProvider } from "./components/StyledSnackbarProvider.tsx";
import "./index.css";
import ThemeConfig from "./theme/index.ts";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
  localnet: { url: getFullnodeUrl("localnet") },
});
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={createTheme(ThemeConfig)}>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} network="mainnet">
        <WalletProvider autoConnect>
          <StyledSnackbarProvider maxSnack={4} autoHideDuration={3000} />
          <BrowserRouter basename="/">
            <Routes>
              <Route path="/" element={<App />}></Route>
            </Routes>
          </BrowserRouter>
          <Analytics />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
