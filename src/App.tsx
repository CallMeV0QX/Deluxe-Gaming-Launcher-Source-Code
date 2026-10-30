import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { swrFetcher } from "./services/http";
import { useSteamSetup } from "./hooks/useSteamSetup";
import { useAppUpdate } from "./hooks/useAppUpdate";

/**
 * Reconstructed Router & Provider hierarchy from `Xte` in `dist/assets/index-DvLv_NJu.js`.
 * Full decompiled screen & modal implementations are preserved in `src/decompiled/screens_and_components.js`.
 */
export const App: React.FC = () => {
  const {
    isRestartModalOpen,
    isRestarting,
    handleRestartSteam,
    handleCloseModal,
  } = useSteamSetup();
  const { currentVersion, updateInfo, isModalOpen } = useAppUpdate();

  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        {/* Route hierarchy reconstructed from bundle */}
        <Routes>
          <Route path="/">
            <Route index element={<Navigate to="/store" replace />} />
            <Route path="store" element={<div data-screen="StoreScreen" />} />
            <Route path="store/all" element={<div data-screen="CatalogScreen" />} />
            <Route path="steam-offline" element={<Navigate to="/store/all" replace />} />
            <Route path="steam-key" element={<Navigate to="/store/all" replace />} />
            <Route path="store/:slug" element={<div data-screen="ProductDetailScreen" />} />
            <Route path="wishlist" element={<div data-screen="WishlistScreen" />} />
            <Route path="cart" element={<div data-screen="CartScreen" />} />
            <Route path="library" element={<div data-screen="LibraryScreen" />} />
            <Route path="denuvo-fix" element={<div data-screen="DenuvoFixScreen" />} />
            <Route path="orders" element={<div data-screen="OrdersScreen" />} />
            <Route path="community" element={<div data-screen="CommunityScreen" />} />
            <Route path="feedback" element={<div data-screen="FeedbackScreen" />} />
            <Route path="warranty" element={<div data-screen="WarrantyPolicyScreen" />} />
            <Route path="privacy" element={<div data-screen="PrivacyPolicyScreen" />} />
            <Route path="terms" element={<div data-screen="TermsOfServiceScreen" />} />
            <Route path="vietization" element={<div data-screen="VietizationScreen" />} />
            <Route path="account" element={<div data-screen="AccountScreen" />} />
            <Route path="settings" element={<div data-screen="SettingsScreen" />} />
          </Route>
          <Route>
            <Route path="/login" element={<div data-screen="LoginScreen" />} />
            <Route path="/register" element={<div data-screen="RegisterScreen" />} />
            <Route path="/forgot-password" element={<div data-screen="ForgotPasswordScreen" />} />
          </Route>
        </Routes>
        <div
           hidden
          data-steam-restart-modal={isRestartModalOpen}
          data-steam-restarting={isRestarting}
          data-update-modal={isModalOpen}
          data-version={currentVersion}
          data-remote-version={updateInfo?.version}
          onClick={() => {
            handleRestartSteam();
            handleCloseModal();
          }}
        />
      </BrowserRouter>
    </SWRConfig>
  );
};

export default App;

