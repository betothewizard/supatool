import { browser } from 'wxt/browser';
import { FOCUS_SPOOF_STORAGE_KEY } from '../features/focus-anti-detect/storage';

export default defineBackground(() => {
  console.log('[Supatool Background] Started');

  // Helper to check if domain matches always-on list
  async function isDomainAlwaysOn(urlStr?: string): Promise<boolean> {
    if (!urlStr) return false;
    try {
      const hostname = new URL(urlStr).hostname;
      const { alwaysOnDomains = [] } = await browser.storage.local.get<{ alwaysOnDomains: string[] }>('alwaysOnDomains');
      return alwaysOnDomains.some((d) => hostname === d || hostname.endsWith('.' + d));
    } catch {
      return false;
    }
  }

  // Check if a tab should be spoofed
  async function shouldSpoofTab(tabId?: number, urlStr?: string): Promise<{ isSpoofing: boolean; isAlwaysOn: boolean; isGlobal: boolean }> {
    const { spoofingTabs = {}, globalSpoofEnabled = false } = await browser.storage.local.get<{
      spoofingTabs: Record<number, boolean>;
      globalSpoofEnabled: boolean;
    }>(['spoofingTabs', 'globalSpoofEnabled']);

    const isAlwaysOn = await isDomainAlwaysOn(urlStr);
    const isTabEnabled = tabId ? !!spoofingTabs[tabId] : false;
    const isSpoofing = isTabEnabled || isAlwaysOn || globalSpoofEnabled;

    return { isSpoofing, isAlwaysOn, isGlobal: globalSpoofEnabled };
  }

  // Update extension badge
  async function updateBadge(tabId: number, isSpoofing: boolean) {
    try {
      if (isSpoofing) {
        await browser.action.setBadgeText({ text: 'ON', tabId });
        await browser.action.setBadgeBackgroundColor({ color: '#22c55e', tabId });
      } else {
        await browser.action.setBadgeText({ text: '', tabId });
      }
    } catch {}
  }

  // Seed or clear sessionStorage flag in tab frames and apply live overrides
  async function syncSessionStorageFlag(tabId: number, enable: boolean) {
    try {
      if (enable) {
        await browser.scripting.executeScript({
          target: { tabId, allFrames: true },
          world: 'MAIN',
          func: (key: string) => {
            try {
              window.sessionStorage.setItem(key, 'true');
              Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
              Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
              document.hasFocus = () => true;
            } catch {}
          },
          args: [FOCUS_SPOOF_STORAGE_KEY],
        });
      } else {
        await browser.scripting.executeScript({
          target: { tabId, allFrames: true },
          world: 'MAIN',
          func: (key: string) => {
            try {
              window.sessionStorage.removeItem(key);
            } catch {}
          },
          args: [FOCUS_SPOOF_STORAGE_KEY],
        });
      }
    } catch {}
  }

  // Listen for tab navigation to update flags & badge
  if (browser.webNavigation?.onCommitted) {
    browser.webNavigation.onCommitted.addListener(async (details) => {
      if (details.frameId === 0) {
        const { isSpoofing } = await shouldSpoofTab(details.tabId, details.url);
        await updateBadge(details.tabId, isSpoofing);
        if (isSpoofing) {
          await syncSessionStorageFlag(details.tabId, true);
        }
      }
    });
  }

  // Update flags on tab content loading/updates
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
      const { isSpoofing } = await shouldSpoofTab(tabId, tab.url);
      await updateBadge(tabId, isSpoofing);
      if (isSpoofing) {
        await syncSessionStorageFlag(tabId, true);
      }
    }
  });

  // Update badge when switching active tabs
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      const { isSpoofing } = await shouldSpoofTab(activeInfo.tabId, tab?.url);
      await updateBadge(activeInfo.tabId, isSpoofing);
    } catch {}
  });

  // Clean up tab tracking when tab is closed
  browser.tabs.onRemoved.addListener(async (tabId) => {
    try {
      const { spoofingTabs = {} } = await browser.storage.local.get<{ spoofingTabs: Record<number, boolean> }>('spoofingTabs');
      if (spoofingTabs[tabId]) {
        delete spoofingTabs[tabId];
        await browser.storage.local.set({ spoofingTabs });
      }
    } catch {}
  });

  // Listen for runtime messages from popup
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
      const action = message?.action;
      if (action === 'get_focus_status') {
        const tabId = message.tabId;
        const url = message.url;
        const status = await shouldSpoofTab(tabId, url);
        const { spoofingTabs = {} } = await browser.storage.local.get<{ spoofingTabs: Record<number, boolean> }>('spoofingTabs');
        sendResponse({
          ...status,
          isTabEnabled: !!spoofingTabs[tabId],
        });
      } else if (action === 'toggle_tab_focus') {
        const tabId = message.tabId;
        const { spoofingTabs = {} } = await browser.storage.local.get<{ spoofingTabs: Record<number, boolean> }>('spoofingTabs');
        const nextState = !spoofingTabs[tabId];
        spoofingTabs[tabId] = nextState;
        await browser.storage.local.set({ spoofingTabs });

        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const { isSpoofing } = await shouldSpoofTab(tabId, tab?.url);
        await updateBadge(tabId, isSpoofing);
        await syncSessionStorageFlag(tabId, isSpoofing);

        if (tabId && message.autoReload) {
          await browser.tabs.reload(tabId);
        }
        sendResponse({ isSpoofing });
      } else if (action === 'toggle_domain_focus') {
        const domain = message.domain;
        if (domain) {
          const { alwaysOnDomains = [] } = await browser.storage.local.get<{ alwaysOnDomains: string[] }>('alwaysOnDomains');
          const exists = alwaysOnDomains.includes(domain);
          const nextDomains = exists ? alwaysOnDomains.filter((d) => d !== domain) : [...alwaysOnDomains, domain];
          await browser.storage.local.set({ alwaysOnDomains: nextDomains });

          const tabId = message.tabId;
          if (tabId) {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const { isSpoofing } = await shouldSpoofTab(tabId, tab?.url);
            await updateBadge(tabId, isSpoofing);
            await syncSessionStorageFlag(tabId, isSpoofing);
            if (message.autoReload) {
              await browser.tabs.reload(tabId);
            }
          }
          sendResponse({ isAlwaysOn: !exists });
        }
      } else if (action === 'toggle_global_focus') {
        const { globalSpoofEnabled = false } = await browser.storage.local.get<{ globalSpoofEnabled: boolean }>('globalSpoofEnabled');
        const nextGlobal = !globalSpoofEnabled;
        await browser.storage.local.set({ globalSpoofEnabled: nextGlobal });

        const tabId = message.tabId;
        if (tabId) {
          const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
          const { isSpoofing } = await shouldSpoofTab(tabId, tab?.url);
          await updateBadge(tabId, isSpoofing);
          await syncSessionStorageFlag(tabId, isSpoofing);
          if (message.autoReload) {
            await browser.tabs.reload(tabId);
          }
        }
        sendResponse({ globalSpoofEnabled: nextGlobal });
      } else if (action === 'reload_tab') {
        if (message.tabId) {
          await browser.tabs.reload(message.tabId);
        }
        sendResponse({ success: true });
      }
    })();
    return true;
  });
});
