# Privacy Policy for Supatool

**Effective Date:** October 8, 2026  
**Last Updated:** October 8, 2026

## 1. Overview

**Supatool - Developer Tools** ("Supatool", "the extension", "we", "us") is an open-source browser extension designed for web developers. It provides productivity tools including one-click site data clearing and tab focus/visibility keep-alive emulation for local and web development workflows.

We believe privacy is a fundamental right. Supatool is engineered to operate **100% locally on your machine**. We do not collect, store, sell, or transmit any user data.

---

## 2. Information We Do NOT Collect

Supatool does **NOT** collect:
- Personally Identifiable Information (name, email address, physical address, phone number).
- Financial, payment, or authentication credentials.
- Browsing history, visited websites, or search queries.
- Website contents, form inputs, or cookies.
- Device fingerprints, IP addresses, or location data.
- Telemetry, analytics, or behavioral tracking data.

---

## 3. How Permissions Are Used

Supatool requests only the permissions necessary to provide its developer utilities:

| Permission | Purpose |
| :--- | :--- |
| **`browsingData`** | Allows developers to purge cookies, local storage, indexedDB, cache, and service workers for the currently active tab origin with a single click. |
| **`host_permissions` (`<all_urls>`)** | Enables the extension to operate across any local or web development target (`localhost`, custom dev ports, staging, and production domains) where developers test their applications. |
| **`tabs`** | Reads the URL and origin of the currently active tab solely to determine which domain to clear and to display the active state badge. |
| **`webNavigation`** | Listens for document commit events on web pages to apply focus keep-alive emulation at page load for whitelisted domains. |
| **`scripting`** | Injects runtime focus keep-alive flags into active tab frames when toggled by the developer in the extension popup. |
| **`storage`** | Saves user preferences (e.g. domain whitelist and master toggle settings) locally in your browser using `chrome.storage.local`. |

---

## 4. Data Storage & Transmission

- **Local Execution**: All extension code and operations execute entirely inside your local browser instance.
- **Zero Remote Servers**: Supatool connects to **no** external servers, analytics platforms, or cloud databases. No network requests are made by the extension outside of standard local browser APIs.
- **No Third-Party Sharing**: We do not partner with advertisers, data brokers, or tracking networks. Your data is never sold, shared, or monetized.

---

## 5. Open Source Transparency

Supatool is open source. You can audit the complete source code, build scripts, and permissions handling directly on GitHub:  
[https://github.com/betothewizard/supatool](https://github.com/betothewizard/supatool)

---

## 6. Changes to This Policy

If we update this Privacy Policy, the revised version will be published to this page with an updated "Last Updated" date.

---

## 7. Contact Us

If you have questions, feedback, or concerns regarding this Privacy Policy:
- **Maintainer**: betothewizard
- **Email**: betothewizard@gmail.com
- **Repository**: [https://github.com/betothewizard/supatool](https://github.com/betothewizard/supatool)
