import { browser } from 'wxt/browser';

export const FOCUS_SPOOF_STORAGE_KEY = 'SUPATOOL_FOCUS_ANTI_DETECT';

export interface FocusStatus {
  isSpoofing: boolean;
  isAlwaysOn: boolean;
  isGlobal: boolean;
  isTabEnabled: boolean;
}

export async function queryFocusStatus(tabId?: number, url?: string): Promise<FocusStatus> {
  try {
    return await browser.runtime.sendMessage({
      action: 'get_focus_status',
      tabId,
      url,
    });
  } catch {
    return { isSpoofing: false, isAlwaysOn: false, isGlobal: false, isTabEnabled: false };
  }
}

export async function toggleTabFocus(tabId: number, autoReload: boolean = false): Promise<{ isSpoofing: boolean }> {
  return browser.runtime.sendMessage({ action: 'toggle_tab_focus', tabId, autoReload });
}

export async function toggleDomainFocus(domain: string, tabId?: number, autoReload: boolean = false): Promise<{ isAlwaysOn: boolean }> {
  return browser.runtime.sendMessage({ action: 'toggle_domain_focus', domain, tabId, autoReload });
}

export async function toggleGlobalFocus(tabId?: number, autoReload: boolean = false): Promise<{ globalSpoofEnabled: boolean }> {
  return browser.runtime.sendMessage({ action: 'toggle_global_focus', tabId, autoReload });
}

export async function reloadActiveTab(tabId: number): Promise<void> {
  return browser.runtime.sendMessage({ action: 'reload_tab', tabId });
}
