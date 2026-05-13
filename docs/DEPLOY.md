# Deploy — Cloudflare Pages (free)

Two paths. Pick **A** for set-and-forget auto-deploy on every push. Pick **B**
for a faster one-time deploy from your laptop.

## Path A — Git integration (recommended)

1. Sign up at <https://dash.cloudflare.com> (free, no credit card required for Pages).
2. Left nav → **Workers & Pages** → **Create application** → **Pages** tab →
   **Connect to Git**.
3. Authorize the Cloudflare GitHub app on your account.
4. Pick repo `mjgullaci/thereplatform`. Click **Begin setup**.
5. Build settings:
   - **Project name:** `wordwell` (becomes `wordwell.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leave blank)*
   - **Environment variables:** add `NODE_VERSION` = `22`
6. Click **Save and Deploy**. First build takes ~90 seconds.
7. When it finishes you get a live URL: `https://wordwell.pages.dev`.

After this, every push to `main` auto-deploys. PR branches get preview URLs
(`https://<commit>.wordwell.pages.dev`).

## Path B — One-shot from your laptop

```bash
npm install -g wrangler
wrangler login            # opens browser to authenticate
npm run build
wrangler pages deploy dist --project-name wordwell
```

First run creates the project and asks for a production branch — say `main`.

## Custom domain (optional, free)

Once deployed:

1. Cloudflare dashboard → your Pages project → **Custom domains** → **Set up
   a custom domain**.
2. If the domain is already on Cloudflare DNS, it's one click.
3. If not, Cloudflare gives you DNS records to add at your registrar.

HTTPS is automatic.

## Notes

- `public/_redirects` ships a SPA fallback (`/* /index.html 200`) so deep
  links like `/play` and `/settings` work after refresh / direct navigation.
- `.nvmrc` pins Node 22; Cloudflare reads this automatically.
- PWA service worker is generated at build time. After first visit the app
  works offline.
- Free tier limits: 500 builds/month, unlimited bandwidth, unlimited
  requests. Plenty for early-stage indie traffic.
