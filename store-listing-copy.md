# Evidence Clip Ledger

Turn the page you are reading into a structured evidence record without copying it into a cloud service.

Click the extension, state the exact fact the page supports, grade its authority, assign an evidence strength, and connect it to a case. Evidence Clip Ledger keeps the page title, URL, fact, note, and rating in local Chrome extension storage. Open the archive to search the ledger or export it as JSON or CSV.

## Single purpose

Create a user-directed, local source evidence ledger from the currently active page.

## Features

- User-invoked capture of the active page title and URL
- Authority grades A through D
- Evidence strength scores 1 through 5
- Case and project organization
- Local search and deletion controls
- JSON and CSV export
- No server, account, telemetry, analytics, advertising, or remote code

## Permission rationale

- `activeTab`: temporarily reads the current page title and URL only after the user clicks the extension.
- `storage`: saves evidence records locally on the user's device.

## Privacy

The extension does not transmit data to Japan Legacy Parts or another service. Exported data leaves the extension only when the user explicitly downloads a JSON or CSV file.
