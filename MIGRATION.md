# Flag to Remember: retire WordPress and Plesk

The public domain has **not** switched. `FTR_STANDALONE` defaults to false, so the existing WordPress bridge stays available until the new connections pass the checks below. Airtable's existing tables and public registry view stay in place. Domain email already uses Google Workspace.

## Replacement behavior

- Forms 5, 6, and 8 retain the existing field definitions, conditional fields, validation, honeypot, and reCAPTCHA v2. The new server verifies CAPTCHA with Google and checks its hostname.
- A name registration writes one summary to Donations from Name Form and one Name Registry row per visible name. Contact and newsletter entries use the existing Contact Form table. All Airtable writes finish before the browser reports success.
- Every destination table needs a single line text field named `Website submission ID`. Upserts use it to make partial saves and network retries safe. Form keys include a browser request UUID and a canonical payload hash; donation keys use the Stripe session ID.
- Vercel Workflow delivers the four existing email templates, optional Cognito story invitation, Mailchimp signup, and active admin notifications. Each notification run claims a retained hook before side effects; duplicate requests converge for 30 days. Workflow step retries do not repeat Airtable writes. SMTP has no exactly once delivery guarantee; stable Message-IDs reduce duplicate deliveries after uncertain acknowledgements. Inspect and retry failed steps in Vercel rather than starting a new notification run.
- Mailchimp uses the same audience, `612c639174`. Existing unsubscribe preferences are preserved.
- Donations use Stripe hosted Checkout in the existing account. The signed webhook accepts paid USD sessions tagged by this website, writes the same donation table, and starts durable notifications. Replayed events upsert the same row. A return-page visit alone never creates a donation or claims payment success without checking Stripe.
- Email icons are included locally; their old WordPress URLs redirect to the new files.

## Connections required before activation

1. Create a narrowly scoped Airtable personal access token with `data.records:write`, restricted to Flag to Remember (`appz2rK239E1b3rXD`). The ION token cannot be reused. The submission field is already present in Name Registry (`tblUT9mTyZ8XE3zB4`), Donations from Name Form (`tbl0tL5ASXkyRKvyv`), and Contact Form (`tbl6LDBTXdgEf5noo`).
2. Move only the existing FTR Gmail address/app password and FTR Mailchimp API key from Heroku to this Vercel project. Do not copy the shared Heroku application's unrelated credentials or retire the shared app.
3. Resolve WordPress's `{admin_email}` and set `FTR_ADMIN_EMAIL` to the same recipient. Existing admin notifications are active for name, contact, and donation forms; newsletter admin notifications are off.
4. Configure the existing reCAPTCHA secret and allow the production hostnames. An isolated test hostname/key is required for browser tests on a preview. Keep CAPTCHA enabled in production.
5. Obtain access to Flag's existing Stripe account. Use test keys and a separate test Airtable base for payment tests. Configure a **snapshot** webhook for `checkout.session.completed` and `checkout.session.async_payment_succeeded` at `/api/stripe/webhook`, using the SDK's API version, and store its signing secret. The new checkout accepts card payments; review existing account methods before expanding them.
6. Set the variables listed in `.env.example`, then enable `FTR_STANDALONE=true` and redeploy. `SITE_URL` must match the tested deployment. Preview and production credentials must stay separate. Never point preview payment tests at the production Airtable base.

## Validation and cutover

- `npm run test:standalone` runs offline mapping, retry, CAPTCHA, email escaping, and donation checks without contacting any external service. Run `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --omit=dev` too.
- Exercise all form branches in an isolated preview: 1–5 names, optional organization/volunteer fields, newsletter, contact, story invitation, admin emails, and Mailchimp preferences. Confirm records and recipients, and replay an entry to verify no duplicate rows or notifications.
- Complete a Stripe test payment, confirm the Airtable record and emails, replay the webhook, and verify invalid signatures and unpaid sessions create no donation. Also verify cancellation and the neutral return-page message.
- Export the historical Gravity Forms entries and settings before retiring the old site. Keep an archive; do not bulk import it into existing Airtable tables without reconciling duplicates. The WordPress forms contain historical entries that may not all be in Airtable.
- Allow existing Gravity Forms/Heroku workers to finish their old entries. Existing Stripe/Gravity Forms webhook handling must remain available for outstanding old checkouts during a transition; do not remove its destination prematurely. Enabling standalone removes the site's legacy proxy, so retain the old endpoint at a separate verified hostname if it still has pending events.
- Switch the public website A/CNAME records only after these checks pass, issue/verify TLS for apex and www, and retest the complete public flows.
- Copy the full authoritative DNS zone to the new DNS host, preserving Google MX, SPF, DKIM, DMARC, verification records, and other services. Change nameservers at the registrar only after the new zone is verified. Website hosting and DNS hosting are separate steps.
- Confirm no required mailbox, DNS, website, entry archive, or old payment event remains dependent on Rockfort/Plesk before cancelling it. Rollback website DNS to `208.87.133.155` if needed; keep the prior DNS snapshot.

## Dependency patches

The current Workflow SDK pins vulnerable transitive versions of Zod and Undici. Overrides select patched Zod 4.6.7 and Undici 7.30.1. Keep the overrides until upstream dependencies include those fixes; verify the build and workflow execution when updating them.
