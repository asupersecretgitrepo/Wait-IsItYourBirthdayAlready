# Time Capsule (Private-by-Obscurity)

This project is a private, unlisted time-capsule website built with Vite + Vanilla JS.

## Important Privacy Notice

This setup is **obscurity, not security**.

- If someone has the secret URL, they can open the site.
- Source code is still visible to anyone with access to the deployed files.
- Sharing the secret link publicly removes privacy.
- For real protection, use backend authentication and authorization.

## Current Secret Slug

The app lives at:

`/vault-k9f3b1a2c7d4e8f6a1b2c3d4/`

Root `/` is a decoy page and does not link to the secret path.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Build output goes to `dist/` and is GitHub Pages compatible.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Run `npm install` then `npm run build` locally.
3. Publish the `dist/` folder contents to your Pages branch (for example `gh-pages`) or deploy with your preferred Pages workflow.
4. Open the deployed URL and append the secret slug path.

Example deployed path:

`https://<username>.github.io/<repo>/vault-k9f3b1a2c7d4e8f6a1b2c3d4/`

> If your repository is not the user/org root repository, adjust `base` in `vite.config.js` for your Pages project path strategy.

## How to Change the Secret Slug

1. Pick a new hard-to-guess slug (24 alphanumeric chars after `vault-`).
2. Rename folder `vault-k9f3b1a2c7d4e8f6a1b2c3d4/` to your new slug.
3. Update the `secretSlug` value in `vite.config.js`.
4. Search and replace the old slug in this README.
5. Rebuild and redeploy.

## How to Add New Chapters

Edit `vault-k9f3b1a2c7d4e8f6a1b2c3d4/data.js` in `CHAPTERS`.

Each chapter needs:

- `key` (string, e.g. `"2029"`)
- `year` (number)
- `title`
- `summary`
- optional `content` (array of paragraphs or `null`)
- optional `art` image path in the secret folder

Unlock rule is automatic in `app.js`:

- Chapter unlocks when current date is on/after March 9 of that chapter year.

## How to Add Redeem Codes

Edit `vault-k9f3b1a2c7d4e8f6a1b2c3d4/data.js` in `REDEEM_CODES`.

Example:

```js
'CODE-NEWMEMORY': ['2029']
```

Codes are unlimited reuse and idempotent. Unlock state is stored in localStorage under:

`vault_unlocks`

## Notes on Locked Content

- Locked chapters show unlock timing in the vault list.
- Chapter content is only rendered after unlock.
- Do not add future chapter content if you do not want it shipped yet.
