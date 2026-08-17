const BASE_URL = process.env.VATNODE_BASE_URL || 'https://api.vatnode.dev'

const EVENT_TYPES = [
  {
    value: 'VAT_BECAME_INVALID',
    sample: 'VAT_BECAME_INVALID',
    label: 'VAT number became invalid',
  },
  { value: 'VAT_BECAME_VALID', sample: 'VAT_BECAME_VALID', label: 'VAT number became valid' },
  { value: 'COMPANY_NAME_CHANGED', sample: 'COMPANY_NAME_CHANGED', label: 'Company name changed' },
  {
    value: 'COMPANY_ADDRESS_CHANGED',
    sample: 'COMPANY_ADDRESS_CHANGED',
    label: 'Company address changed',
  },
  { value: 'VIES_UNAVAILABLE', sample: 'VIES_UNAVAILABLE', label: 'VIES was unavailable all day' },
  {
    value: 'SUBSCRIPTION_DISABLED',
    sample: 'SUBSCRIPTION_DISABLED',
    label: 'Monitoring was disabled',
  },
]

const normalizeVatId = (vatId) =>
  String(vatId || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

module.exports = { BASE_URL, EVENT_TYPES, normalizeVatId }
