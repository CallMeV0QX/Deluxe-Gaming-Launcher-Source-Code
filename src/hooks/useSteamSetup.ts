import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { isTauriEnvironment, tauriCommands } from "../services/tauri";

export const useSteamSetup = () => {
  const { t } = useTranslation();
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleCloseModal = useCallback(() => {
    setIsRestartModalOpen(false);
  }, []);

  const handleRestartSteam = useCallback(async () => {
    if (!isTauriEnvironment()) return;
    setIsRestarting(true);
    const toastId = toast.loading(t("steamSetup.injecting"));
    try {
      const [dllRes, sycRes] = await Promise.allSettled([
        tauriCommands.injectDllsToSteam(),
        tauriCommands.injectSyctoolToAppdata(),
      ]);

      if (dllRes.status === "rejected") {
        const msg =
          dllRes.reason instanceof Error
            ? dllRes.reason.message
            : String(dllRes.reason);
        toast.error(t("steamSetup.restartModalError", { message: msg }), {
          id: toastId,
          duration: 6000,
        });
        return;
      }

      const result = dllRes.value;
      if (result.skipped_files.length > 0) {
        toast.error(
          t("steamSetup.partialSuccess", {
            files: result.skipped_files.join(", "),
          }),
          { id: toastId, duration: 6000 }
        );
      } else {
        toast.success(t("steamSetup.restartModalSuccess"), {
          id: toastId,
          duration: 5000,
        });
        setIsRestartModalOpen(false);
      }

      if (sycRes.status === "rejected") {
        console.warn("[SteamSetup] syctool injection warning:", sycRes.reason);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t("steamSetup.restartModalError", { message: msg }), {
        id: toastId,
        duration: 6000,
      });
    } finally {
      setIsRestarting(false);
    }
  }, [t]);

  useEffect(() => {
    (async () => {
      if (!isTauriEnvironment()) return;
      const [dllRes, sycRes] = await Promise.allSettled([
        tauriCommands.copyDllsToSteam(),
        tauriCommands.copySyctoolToAppdata(),
      ]);

      if (dllRes.status === "fulfilled") {
        const val = dllRes.value;
        if (val.steam_found) {
          if (
            val.requires_steam_restart ||
            (val.skipped_files.length > 0 && val.steam_was_running)
          ) {
            console.info(
              "[SteamSetup] Steam is running with pending injection files, prompting user."
            );
            setIsRestartModalOpen(true);
          } else if (val.skipped_files.length > 0) {
            toast.error(
              t("steamSetup.partialSuccess", {
                files: val.skipped_files.join(", "),
              }),
              { duration: 6000 }
            );
          } else {
            console.info(
              `[SteamSetup] Copied ${val.copied_files.length} DLL(s), ${val.already_existing_files.length} already present, ${val.skipped_files.length} failed. Steam: ${val.steam_path}`
            );
          }
        } else {
          console.info("[SteamSetup] Steam not found, skipping DLL setup.");
        }
      } else {
        const msg =
          dllRes.reason instanceof Error
            ? dllRes.reason.message
            : String(dllRes.reason);
        console.error("[SteamSetup] Failed to copy DLLs:", msg);
        toast.error(t("steamSetup.error", { message: msg }), {
          duration: 6000,
        });
      }

      if (sycRes.status === "fulfilled") {
        const val = sycRes.value;
        if (val.syctool_found) {
          if (val.failed) {
            console.error("[Syctool] Failed to copy syc binary.");
          } else {
            console.info(
              `[Syctool] syc binary ${val.copied ? "copied" : "already present"}. Dir: ${val.syctool_dir}`
            );
          }
        } else {
          console.info("[Syctool] syctool directory not found, skipping.");
        }
      } else {
        const msg =
          sycRes.reason instanceof Error
            ? sycRes.reason.message
            : String(sycRes.reason);
        console.error("[Syctool] Failed to inject syc:", msg);
      }
    })();
  }, [t]);

  return {
    isRestartModalOpen,
    isRestarting,
    handleRestartSteam,
    handleCloseModal,
  };
};

