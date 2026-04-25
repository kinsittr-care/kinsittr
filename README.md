# KinSittr

KinSittr is a Canadian childcare platform connecting families with verified nannies. Every caregiver on the platform passes a three-step vetting process — background check, reference calls, and a live interview — before their profile is ever visible to families.

## What's in this repo

This is a monorepo containing the KinSittr marketing site and supporting packages.

```
apps/
  web/        Next.js 16 app (marketing site)
packages/     Shared utilities and config
```

## Marketing site (`apps/web`)

Built with Next.js 16 (App Router), Tailwind CSS v4, and DM Serif Display + DM Sans. All pages are statically generated.

| Route | Description |
|---|---|
| `/` | Landing page |
| `/about` | Our story, values, and team |
| `/safety` | Verification process and trust signals |
| `/verification` | Nanny application walkthrough |
| `/nanny-resources` | Benefits, pay, and guides for caregivers |
| `/contact` | Contact form and team info |

### Getting started

```bash
cd apps/web
yarn dev
```
