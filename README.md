# vatnode for Zapier

Validate EU VAT numbers against VIES, monitor them for changes, and look up VAT rates — from any Zap.

Built on the [Zapier Platform CLI](https://docs.zapier.com/platform/quickstart/cli-tutorial). The API it talks to is documented at [vatnode.dev/docs](https://vatnode.dev/docs).

## What the integration does

**Trigger**

- **VAT Number Changed** — fires when a monitored VAT number stops being valid, becomes valid again, or the trader name or address changes in VIES. Real-time: it registers a vatnode webhook, it does not poll. Optional filters by event type and by VAT number.

**Actions**

- **Validate VAT Number** — checks a VAT number against VIES and returns validity, trader name and address, the country's VAT rates, and the VIES consultation number when the account has a requester VAT configured.
- **Monitor VAT Number** — adds a VAT number to daily monitoring. Re-running the same Zap returns the existing subscription instead of failing.

**Search**

- **Find VAT Rates** — current standard, reduced, super-reduced and parking rates for a European country.

## Authentication

One field: a vatnode API key from the [dashboard](https://vatnode.dev/dashboard/api-keys), sent as `Authorization: Bearer <key>`.

Live keys (`vat_live_`) work everywhere. Test keys (`vat_test_`) validate the `XX` fixture numbers but cannot create monitoring subscriptions or webhooks — the trigger and **Monitor VAT Number** need a live key.

## Ready-made scenarios

- **New customer in the CRM → Validate VAT Number → update the record.** Store `valid`, `companyName` and `consultationNumber` on the account so the reverse-charge decision has evidence behind it.
- **New paid invoice → Validate VAT Number → Slack alert when invalid.** Catches a customer whose VAT registration lapsed before the invoice reaches the accountant.
- **New customer → Monitor VAT Number.** Every counterparty gets watched from the day it signs up.
- **VAT Number Changed (`VAT_BECAME_INVALID`) → create a task + email the account owner.** The invoice stops being reverse-charge-eligible the moment this fires.
- **Row added to a spreadsheet → Validate VAT Number → write the result back.** Bulk cleanup of a customer list without writing code.

## Local development

```bash
npm install
npm test
npx zapier validate
```

`VATNODE_BASE_URL` overrides the API host when testing against a local API.

## Publishing

```bash
npx zapier register "vatnode"   # first time only
npx zapier push
```

Then submit for review in the Zapier Developer Platform. The listing stays in public beta for 90 days before it becomes fully public.

## License

MIT © Iurii Rogulia
