# YU FENG Portal

GitHub Pages-ready static portal for internal production, document, and project links.

## Deploy

Publish this repository with GitHub Pages. The site does not need a build step, package install, server runtime, or external font/CDN dependency.

Required files:

- `index.html`
- `assets/styles.css`
- `assets/app.js`
- `data/systems.js`
- `logo.png`
- `404.html`
- `offline.html`

## Add A System

Edit `data/systems.js` and add one object to `SYSTEMS`.

```js
{
  id: 'unique-system-id',
  name: 'System Name',
  desc: 'Short description shown on the card',
  url: 'https://example.com',
  healthUrl: 'https://example.com',
  category: 'production',
  icon: 'activity',
  vpn: true,
  healthCheck: true,
  keywords: ['search', 'aliases']
}
```

Supported categories are defined in `CATEGORIES`. Supported icons are `activity`, `briefcase`, `checkSquare`, `factory`, and `folder`.

Use `healthUrl` when the page users open is not a good endpoint for background reachability checks.

## GitHub Pages Notes

When the portal is served through GitHub Pages, the page is HTTPS. Browsers block background `fetch()` checks from HTTPS pages to HTTP intranet URLs. The portal handles this by showing `需 VPN` instead of a false offline error; direct links still open normally.
