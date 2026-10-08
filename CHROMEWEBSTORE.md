# Chrome Web Store Listing — Supatool

> Last Updated: 2026-10-08

## Store Listing

**Extension Name** [REQUIRED]
Supatool - Developer Tools

**Short Description** [REQUIRED]
Fast web dev tools: instant site data purge (cookies & cache) and tab focus keep-alive emulation for background testing.

**Detailed Description** [REQUIRED]
Supatool is a lightweight, high-performance browser extension built specifically for web developers, testers, and power users who need fast site resets and seamless background tab execution.

KEY FEATURES

• Fast Site Data Reset:
Purge cookies, local storage, indexedDB, cache, and service workers for the currently active tab origin with a single click. No more navigating through deep Chrome DevTools Application panels to clear state during authentication or API testing.

• Tab Focus & Visibility Keep-Alive (Focus Emulation):
Emulate continuous tab visibility and window focus in the background. Prevent background throttling, paused timers, or suspended media playback when switching tabs during multi-tab workflows, streaming UI tests, WebSocket syncing, or web game development.

• Per-Domain & Master Controls:
Enable keep-alive per tab, persist rules automatically for specific domains (e.g. localhost, staging), or toggle global mode across all tabs.

• Instant Status Badge:
Clear toolbar badge indicators confirm when tab keep-alive is active. Optional automatic tab reload applies changes immediately.

HOW TO USE

1. Open any web page or local development server (e.g. localhost:3000).
2. Click the Supatool icon in your browser toolbar.
3. Use "Clear Cache & Storage" to reset the active origin's state in one click.
4. Toggle "Active Tab Keep-Alive" or "Always Active on Domain" to prevent the page from sleeping or pausing when switching to other windows.

PRIVACY & SECURITY

Supatool is 100% private and runs entirely on your local machine:
• No user data or browsing activity is ever collected, tracked, or transmitted.
• Zero remote servers, zero third-party telemetry, zero ads.
• Completely open source under the MIT license.

SUPPORT & SOURCE CODE

• Source Code: https://github.com/betothewizard/supatool
• Issue Tracker & Feedback: https://github.com/betothewizard/supatool/issues
• Contact: betothewizard@gmail.com

**Category** [REQUIRED]
Developer Tools

**Single Purpose** [REQUIRED]
A web developer productivity tool for instant single-origin site data clearing and background tab focus/visibility keep-alive emulation.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename / Path |
|-------|-----------|--------|-----------------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `apps/extension/public/icon/128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | 🟡 To Capture | Supatool popup overview with DevTools controls |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | 🟡 To Capture | 1-Click Clear Site Data with success toast |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | 🟡 To Capture | Tab Keep-Alive active state and domain toggles |
| Small Promo Tile [RECOMMENDED] | 440×280 PNG | 🟡 To Create | Supatool logo with dark slate/cyan badge |
| Marquee Promo Tile | 1400×560 PNG | ⬜ Optional | Promo banner for featured store placements |

### Screenshot Guidelines for Dashboard
• Screenshot 1: Chụp cửa sổ trình duyệt đang mở trang web localhost/dev với popup Supatool hiển thị đầy đủ 2 card "Tab Keep-Alive" và "Clear Site Data".
• Screenshot 2: Chụp sau khi ấn nút "Clear Cache & Storage" hiển thị thông báo xanh thành công: `Cleared site data for http://localhost...`.
• Screenshot 3: Chụp toolbar với badge xanh lá `ON` hiển thị trạng thái Keep-Alive đang kích hoạt.

---

## Permissions Justification

Copy and paste these exact justifications into the Chrome Developer Dashboard form:

| Permission | Type | Justification |
| :--- | :--- | :--- |
| **`browsingData`** | permissions | Required to allow developers to perform a one-click targeted reset of cookies, local storage, indexedDB, cache, and service workers for the currently active tab origin during web development and API testing. |
| **`host_permissions` (`<all_urls>`)** | host_permissions | Required because Supatool is a web developer tool that must operate across any target URL, including `http://localhost:*`, custom local development IP addresses, staging domains, and web applications that the developer is inspecting. |
| **`tabs`** | permissions | Required to query the active tab's URL and origin in order to target data clearing specifically to the current origin, and to update the per-tab toolbar badge indicator. |
| **`webNavigation`** | permissions | Required to detect navigation commit events on web pages and apply focus keep-alive emulation at document start for domains configured in the developer's whitelist. |
| **`scripting`** | permissions | Required to inject and synchronize local session keep-alive emulation flags into target tab frames when toggled in the popup interface. |
| **`storage`** | permissions | Required to persist user developer preferences, such as domain whitelist rules and master toggle states, across browser sessions using `chrome.storage.local`. |

---

## Privacy & Data Use

### Data Collection
**Does the extension collect user data?** No

*(All data collection checkboxes on the Developer Dashboard should be marked as **NOT COLLECTED**).*

| Data Type | Collected? | Transmitted Off-Device? |
| :--- | :--- | :--- |
| Personally identifiable info | No | No |
| Health info | No | No |
| Financial info | No | No |
| Authentication info | No | No |
| Personal communications | No | No |
| Location | No | No |
| Web history | No | No |
| User activity | No | No |
| Website content | No | No |

### Data Use Certification
Check all boxes:
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/betothewizard/supatool/blob/main/PRIVACY.md

---

## Distribution

**Visibility**: Public  
**Regions**: All regions (Worldwide)

---

## Developer Info

**Publisher Name** [REQUIRED]
betothewizard

**Contact Email** [REQUIRED]
betothewizard@gmail.com

**Support URL / Issues** [RECOMMENDED]
https://github.com/betothewizard/supatool/issues

**Homepage URL** [RECOMMENDED]
https://github.com/betothewizard/supatool

---

## Packaging & ZIP Build Command

Run from repository root to produce the store submission package:

```bash
pnpm --filter extension zip
```

Output file:
`apps/extension/.output/supatool-1.0.0.zip` (ready to upload directly to Chrome Developer Dashboard).
