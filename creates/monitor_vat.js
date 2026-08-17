const { BASE_URL, normalizeVatId } = require('../constants')

/**
 * Re-running a Zap on the same customer is normal, so an already-monitored VAT
 * number returns the existing subscription instead of failing the step.
 */
const findExisting = async (z, vatId) => {
  const response = await z.request({ url: `${BASE_URL}/v1/subscriptions` })
  const list = response.data.subscriptions || []
  return list.find((s) => s.vatId === vatId)
}

const perform = async (z, bundle) => {
  const vatId = normalizeVatId(bundle.inputData.vatId)

  const response = await z.request({
    url: `${BASE_URL}/v1/subscriptions`,
    method: 'POST',
    body: { vatId },
    skipThrowForStatus: true,
  })

  if (response.status === 409) {
    const existing = await findExisting(z, vatId)
    if (existing) return existing
  }

  if (response.status >= 400) {
    const error = response.data && response.data.error
    throw new z.errors.Error(
      (error && error.message) || `vatnode returned HTTP ${response.status}`,
      error && error.code,
      response.status,
    )
  }

  return response.data
}

module.exports = {
  key: 'monitor_vat',
  noun: 'Monitored VAT Number',
  display: {
    label: 'Monitor VAT Number',
    description:
      'Adds an EU VAT number to daily monitoring. vatnode re-checks it against VIES and raises an event when it stops being valid or the trader details change.',
  },
  operation: {
    inputFields: [
      {
        key: 'vatId',
        label: 'VAT Number',
        type: 'string',
        required: true,
        helpText: 'Full VAT number including the country prefix, for example `NL822010690B01`.',
      },
    ],
    perform,
    sample: {
      id: '0198f1f0-2f5c-7c3b-9c2a-4c5f0d2a1b77',
      vatId: 'NL822010690B01',
      countryCode: 'NL',
      status: 'active',
      lastCheckedAt: null,
      lastCompanyName: null,
      lastCompanyAddress: null,
      lastValid: null,
      createdAt: '2026-08-14T09:12:44.518Z',
      updatedAt: '2026-08-14T09:12:44.518Z',
    },
    outputFields: [
      { key: 'id', label: 'Subscription ID' },
      { key: 'vatId', label: 'VAT Number' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'status', label: 'Status' },
      { key: 'lastValid', label: 'Last Known Validity', type: 'boolean' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
}
