import { browser } from 'wxt/browser';

export interface ActiveTabInfo {
  tabId?: number;
  url?: string;
  origin: string | null;
  hostname: string | null;
}

export async function getActiveTabInfo(): Promise<ActiveTabInfo> {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      try {
        const parsed = new URL(tab.url);
        if (parsed.protocol.startsWith('http')) {
          return {
            tabId: tab.id,
            url: tab.url,
            origin: parsed.origin,
            hostname: parsed.hostname,
          };
        }
      } catch {}
    }
    return { tabId: tab?.id, url: tab?.url, origin: null, hostname: null };
  } catch (err) {
    console.error('Failed to get active tab info:', err);
    return { origin: null, hostname: null };
  }
}
