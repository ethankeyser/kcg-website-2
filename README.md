# KCG — k-c-g.net

Static marketing site for **Keyser Consulting Group, LLC (KCG, LLC)**. No build step, no
framework, no dependencies — plain HTML/CSS/JS, so it hosts free on GitHub Pages forever.

```
index.html          The whole site (single page, anchored sections)
404.html            Not-found page
assets/styles.css   All styling
assets/script.js    Nav, tabs, scroll reveal, multi-step contact funnel
assets/img/         Logo files, favicons
assets/og-image.png Social-share preview card
assets/KCG-Capability-Statement.pdf
CNAME               Custom domain for GitHub Pages
```

---

## 1. Put it on GitHub

From this folder:

```bash
git init -b main && git add . && git commit -m "New KCG website"
```

Done — this repo is pushed to https://github.com/ethankeyser/kcg-website-2.

## 2. Turn on GitHub Pages

In the repo: **Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `/ (root)` → Save.**

It goes live in about a minute at `https://ethankeyser.github.io/kcg-website-2/`.

## 3. Connect the contact form (required — it does not send until you do this)

The form is built and styled, but it needs a free Formspree endpoint to deliver mail.

1. Sign up at [formspree.io](https://formspree.io) using **contact@k-c-g.net**.
2. Create a **New Form**. Name it "k-c-g.net inquiries". Set the recipient to `contact@k-c-g.net`.
3. Formspree gives you an endpoint like `https://formspree.io/f/abcdwxyz`. Copy the ID
   at the end (`abcdwxyz`).
4. Open `index.html`, find this line (around line 470):

   ```html
   <form id="funnel" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
   ```

   Replace `YOUR_FORM_ID` with your ID, then commit and push.
5. Submit the form once yourself. Formspree emails you a confirmation link the first
   time — click it, or nothing gets delivered.

**Free tier: 50 submissions/month.** If you outgrow it, either upgrade or swap the endpoint
for [Web3Forms](https://web3forms.com) (250/month free) — the form posts standard
`multipart/form-data`, so most providers are a drop-in URL swap.

Until an endpoint is set, the form validates normally but shows a message pointing people
to the phone number and email instead, and logs a warning in the browser console.

### What arrives in your inbox

| Field | Notes |
|---|---|
| Project type | Multi-select — one or more |
| Organization type | Gov / corrections / education / healthcare / prime / commercial |
| Scope | Room count or multi-site |
| Timeline | Includes "Responding to an RFP / bid now" |
| Solicitation number | Optional, for bid responses |
| Project details | Free text |
| Name, Organization, email, Phone | Contact info |

A hidden `_gotcha` honeypot field silently drops bot submissions.

## 4. Point k-c-g.net at it

There is deliberately **no `CNAME` file in this repo yet.** If one is present, GitHub Pages
treats the custom domain as primary and redirects `ethankeyser.github.io/kcg-website-2/` to
`www.k-c-g.net` — which still serves the *old* site, so you'd never see this one. Preview
first, cut over second.

When you're ready to cut over, at your domain registrar (wherever k-c-g.net is managed), set:

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `ethankeyser.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Then in **Settings → Pages → Custom domain**, enter `www.k-c-g.net` and Save — GitHub will
recreate the `CNAME` file for you. Tick **Enforce HTTPS** once the certificate provisions
(can take up to 24 hours).

Note: once the site is on the custom domain, `404.html` is correct as written. On the
temporary `github.io/kcg-website-2/` URL the 404 page renders unstyled, because its asset
paths are absolute (`/assets/...`) — right for the real domain, wrong for a subpath. Not
worth fixing for a preview.

> Do this only when you're ready to cut over — it will replace the current site at that address.

---

## Editing content

Everything lives in `index.html` as plain, readable HTML. Common edits:

- **Phone / email / address** — appear in the contact section, the footer, and the JSON-LD
  block in `<head>`. Search for `717-549-3600` to find all of them.
- **Add a capability card** — copy any `<article class="card">` block in the
  `#capabilities` section.
- **Solutions tabs** — each tab is a `<button role="tab">` plus a matching
  `<div role="tabpanel">`. Keep the `id` / `aria-controls` pair in sync.
- **Colors** — the palette is defined once at the top of `assets/styles.css` under `:root`.
  Change `--accent` and the whole site follows.
- **Capability statement PDF** — replace `assets/KCG-Capability-Statement.pdf`, keeping
  the same filename, and the download links keep working.

## Local preview

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Notes on content accuracy

Copy was drawn from the existing k-c-g.net pages and the 2026 capability statement.
Two things worth a look before launch:

- **Polycom partner tier.** The old site said "Gold Certified" on the About page and
  "Silver Certified Partner" on the Polycom page. Since Polycom is now HP Poly and those
  tiers were retired, the new site avoids naming a tier and instead cites the
  **2016 Circle of Excellence Award for Workflow Integration (North America)**, which is
  unambiguous. Add a current tier if HP Poly has assigned one.
- **"Markets served: 4"** in the hero stat bar counts Criminal Justice / Corrections
  separately. The capability statement lists three (government, education, healthcare);
  corrections is broken out because so much of the software and enclosure work targets it.
