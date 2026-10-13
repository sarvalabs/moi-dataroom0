# MOI Dataroom

The investor document room at https://dataroom.moi.technology: the whitepaper, litepaper, decks and papers, with an admin page for adding and indexing documents. Anyone can open the site; there is no login. The chat that answered questions from the documents is switched off (the widget was removed in August 2026; the route is still deployed).

The app lives in `moi-data-room/`.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind 4: the site, the admin page and every API route.
- Supabase: Postgres with the vector extension for the document index, and a private storage bucket (`investor-docs`) for the files. The server talks to it with the service-role key only.
- pdf-parse, mammoth and OpenAI embeddings read each upload (PDF or Word; PowerPoint cannot be read) and index it.
- Anthropic Claude for the chat (inactive).
- GitHub Actions over SSH: a merge to `main` runs a script on the server that builds and restarts the app.

## Run it locally

```bash
cd moi-data-room
cp .env.local.example .env.local   # fill in the values, never commit this file
npm install
npm run dev
```

The example file lists every variable with a comment. `ADMIN_SECRET` must not be empty: the admin page is the only gate on the site.

## Deploy

- Merging to `main` deploys. The workflow `.github/workflows/deploy.yml` reaches the server over SSH and runs `/root/scripts/deploy-moi-dataroom.sh` there (the script is on the server, not in this repo).
- Secrets and variables are GitHub Actions secrets on this repo. A changed value deploys nothing on its own: run the workflow by hand (Actions, "Deploy MOI Dataroom", Run workflow). Anything starting `NEXT_PUBLIC_` is baked in at build time.
- Nothing runs on a pull request. Run the type check, lint and build yourself before merging.
- There is no rollback. Revert in a new pull request.
- After a deploy, open the site and check that a wrong admin key is refused:

```bash
curl -s -X POST https://dataroom.moi.technology/api/admin/unlock -H 'content-type: application/json' -d '{"key":"x"}'
```

It must answer 403 with "Invalid key".

## The admin page

Open `/admin` and enter `ADMIN_SECRET`. The page offers Add Document; a row per document with Edit, the Download and Email gate toggles, Re-index and Delete; Captured Leads; Calendar events; and Adopters (a form, or Import CSV). The toggles and Re-index swallow errors, so re-read the state after every click. Delete is one click, with no confirmation, and permanent.

## Documents

- Add Document: pick the category first (changing it later clears the title and description), then title, description, the file or an external link, allow download, require email, and the home slot if the document belongs on a tile. The browser uploads straight to the bucket, then the row is created and indexing starts: pending, processing, completed. If it stays at processing or ends failed, press Re-index on that row, one document at a time.
- Editing a document never re-indexes its file. To replace a file, upload the new version as a new document with the same section, title and home slot, wait for completed, then retire the old row. For the whitepaper and litepaper use `moi-data-room/scripts/set-whitepaper.mjs`.
- Uploads are limited to 10 a minute.

## The home page

- Seven hero tiles, one per slot: foundation, paradigm, network, pitch-deck, two-pager, litepaper, gtm-deck. Their wording (title, tag, tagline) is the `HERO_CARDS` array in `moi-data-room/src/lib/constants.ts`. Which document a tile opens is the document's "Show on home" slot; with nothing pinned the tile falls back to a title match. Pin rather than rely on the match.
- Below the tiles, documents are listed by category.
- The figures under "Network & Community" are the `STATS` array in the same file, typed by hand.

## Database

- The schema is `moi-data-room/supabase/schema.sql` plus the `migration-*.sql` files in the same folder. There is no migration runner: run a new file by hand in the Supabase SQL editor before the code that needs it merges.
- `migration-add-adopters-leads-require-email.sql` records three objects that were made by hand in production before this file existed: the `adopters` and `document_leads` tables and the `documents.require_email` column. It is written with `IF NOT EXISTS`, so running it again is safe.
- Captured leads are personal data (visitor emails). Read them on screen; do not copy them anywhere.

## Health

- The home page and one document open.
- Every document says completed in the admin page.
- A wrong admin key is refused (the curl above).
