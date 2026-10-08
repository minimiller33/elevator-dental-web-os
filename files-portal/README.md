# Elevator · BE SMILE materials portal

Private client intake portal at https://files.elevatordental.com, deployed as the standalone Cloudflare Worker `elevator-files`. It does not modify the main website or either Mailflare instance.

The 28 requirements come from the approved client brief. Clients can save answers, share cloud links, upload files and submit dated progress snapshots. Each of the 28 points includes three editable suggested answer drafts. Selecting a draft keeps the point pending, autosaves it, and asks whether to append or replace an existing response. Templates leave unknown clinic facts for confirmation. Reviewers can read and download the delivery without editing. Submission records an in-app snapshot; it does not send email.

## Storage and access

D1 database: `elevator-files`. Private R2 bucket: `elevator-files`. Uploads use 8 MiB multipart chunks; maximum 2 GiB per file and 25 GiB / 2,000 retained files per project. Removed files remain recoverable in private storage. Incomplete uploads expire after 24 hours.

Client and reviewer keys are distinct. Session cookies are signed, Secure, HttpOnly and SameSite Strict. Hash-fragment access links are cleared after login. Production secrets are managed with Wrangler; local keys and `.dev.vars` are ignored by Git. Never commit or publish access keys.

## Development and deployment

Run from this directory:

```sh
npm install
npx wrangler d1 execute elevator-files --local --file schema.sql
npx wrangler dev --port 8791
node --test test/security.test.mjs
node test/integration.mjs
npx wrangler deploy
```

Browser QA (`test/browser.mjs`) needs Playwright and a local Chrome executable; current paths target the development workstation. Integration and browser mutations are restricted to localhost.

## Delivery experience

Progress and completion feedback use server-confirmed saved statuses. Clients can jump to the next pending requirement; finishing a section shows a dismissible brief confirmation. Chosen suggestion drafts are highlighted. Files and cloud links use visual cards. Authenticated PNG/JPEG/WebP/GIF previews require recognized raster signatures and a maximum file size of 12 MiB; other files remain downloadable. Reduced-motion preferences disable the feedback animations.

## Design

Elevator logo and blue/cyan identity are retained. Typography and surface styling follow the supplied Pencil export, including its embedded Super Sans VF font, self-hosted under `public/`. The published portal uses responsive layouts from 320 px upward.
