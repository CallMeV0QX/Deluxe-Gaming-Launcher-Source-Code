import { useCallback, useEffect, useState } from "react";
import { appVersionApi } from "../services/api";
import { tauriCommands } from "../services/tauri";

const FALLBACK_VERSION = "0.1.30";
const DISMISSED_VERSION_KEY = "dismissed_app_update_version";
const CHECK_INTERVAL_MS = 1800 * 1000; // 30 minutes

const parseSemver = (version: string) => {
  const cleaned = version.trim().replace(/^v/i, "");
  const [core, prerelease = ""] = cleaned.split("-");
  const numbers = core.split(".").map((n) => parseInt(n, 10) || 0);
  while (numbers.length < 3) numbers.push(0);
  return { numbers, prerelease };
};

const compareSemver = (a: string, b: string): number => {
  const va = parseSemver(a);
  const vb = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    if (va.numbers[i] > vb.numbers[i]) return 1;
    if (va.numbers[i] < vb.numbers[i]) return -1;
  }
  if (!va.prerelease && vb.prerelease) return 1;
  if (va.prerelease && !vb.prerelease) return -1;
  if (!va.prerelease && !vb.prerelease) return 0;
  return va.prerelease.localeCompare(vb.prerelease, undefined, {
    numeric: true,
  });
};

export const isNewerVersion = (remote: string, local: string): boolean =>
  compareSemver(remote, local) > 0;

export const useAppUpdate = () => {
  const [currentVersion, setCurrentVersion] = useState(FALLBACK_VERSION);
  const [updateInfo, setUpdateInfo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ver = await tauriCommands.getAppVersion();
        if (mounted && ver) setCurrentVersion(ver);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const checkForUpdate = useCallback(async () => {
    try {
      let localVer = currentVersion;
      try {
        const v = await tauriCommands.getAppVersion();
        if (v) {
          localVer = v;
          setCurrentVersion(v);
        }
      } catch {}

      const remoteInfo = await appVersionApi.getAppVersion({ silent: true });
      if (!remoteInfo?.version) return;

      if (isNewerVersion(remoteInfo.version, localVer)) {
        setUpdateInfo(remoteInfo);
        if (remoteInfo.forceUpdate) {
          setIsModalOpen(true);
          return;
        }
        if (sessionStorage.getItem(DISMISSED_VERSION_KEY) !== remoteInfo.version) {
          setIsModalOpen(true);
        }
      }
    } catch {}
  }, [currentVersion]);

  useEffect(() => {
    checkForUpdate();
    const timer = setInterval(checkForUpdate, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [checkForUpdate]);

  const handleDismiss = useCallback(() => {
    if (updateInfo?.version && !updateInfo.forceUpdate) {
      sessionStorage.setItem(DISMISSED_VERSION_KEY, updateInfo.version);
    }
    setIsModalOpen(false);
  }, [updateInfo]);

  return {
    currentVersion,
    updateInfo,
    isModalOpen,
    checkForUpdate,
    handleDismiss,
  };
};

