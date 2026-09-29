const { BASE_URL } = require('../constants')

const perform = async (z, bundle) => {
  const countryCode = String(bundle.inputData.countryCode || '')
    .trim()
    .toUpperCase()

  const response = await z.request({
    url: `${BASE_URL}/v1/rates/${countryCode}`,
    skipThrowForStatus: true,
  })

  if (response.status === 404) return []

  if (response.status >= 400) {
    const error = response.data && response.data.error
    throw new z.errors.Error(
      (error && error.message) || `vatnode returned HTTP ${response.status}`,
      error && error.code,
      response.status,
    )
  }

  return [response.data]
}

module.exports = {
  key: 'vat_rates',
  noun: 'VAT Rate',
  display: {
    label: 'Find VAT Rates',
    description:
      'Looks up the current standard, reduced, super-reduced and parking VAT rates for a European country.',
  },
  operation: {
    inputFields: [
      {
        key: 'countryCode',
        label: 'Country Code',
        type: 'string',
        required: true,
        helpText:
          'Two-letter ISO country code, for example `DE`, `FR` or `GR` for Greece. Note that Greek VAT numbers themselves carry the `EL` prefix.',
      },
    ],
    perform,
    sample: {
      countryCode: 'DE',
      countryName: 'Germany',
      isEU: true,
      vatName: 'Umsatzsteuer',
      vatAbbr: 'USt',
      currency: 'EUR',
      standardRate: 19,
      reducedRates: [7],
      superReducedRate: null,
      parkingRate: null,
      vatNumberFormat: 'DE999999999',
      vatNumberPattern: '^DE[0-9]{9}$',
      identifiers: {
        registryAuthorityName: {
          de: { name: 'Amtsgericht', abbr: null },
          en: { name: 'local court', abbr: null },
        },
        registryName: {
          de: { name: 'Handelsregister', abbr: null },
          en: { name: 'commercial register', abbr: null },
        },
        registryCodeName: {
          de: { name: 'Registernummer', abbr: null },
          en: { name: 'register number', abbr: null },
        },
        taxIdName: {
          de: { name: 'Wirtschafts-Identifikationsnummer', abbr: 'W-IdNr.' },
          en: { name: 'Business Identification Number', abbr: null },
        },
        vatIdName: {
          de: { name: 'Umsatzsteuer-Identifikationsnummer', abbr: 'USt-IdNr.' },
          en: { name: 'VAT identification number', abbr: null },
        },
      },
      updatedAt: '2026-08-11',
    },
    outputFields: [
      { key: 'countryCode', label: 'Country Code' },
      { key: 'countryName', label: 'Country' },
      { key: 'isEU', label: 'EU Member', type: 'boolean' },
      { key: 'standardRate', label: 'Standard Rate', type: 'number' },
      { key: 'superReducedRate', label: 'Super-Reduced Rate', type: 'number' },
      { key: 'parkingRate', label: 'Parking Rate', type: 'number' },
      { key: 'vatName', label: 'Local VAT Name' },
      { key: 'vatAbbr', label: 'Local VAT Abbreviation' },
      { key: 'currency', label: 'Currency' },
      { key: 'vatNumberFormat', label: 'VAT Number Format' },
      {
        key: 'identifiers__registryAuthorityName__en__name',
        label: 'Registry Authority (English)',
      },
      { key: 'identifiers__registryName__en__name', label: 'Registry Name (English)' },
      { key: 'identifiers__registryCodeName__en__name', label: 'Registry Number Name (English)' },
      { key: 'identifiers__taxIdName__en__name', label: 'Tax ID Name (English)' },
      { key: 'identifiers__vatIdName__en__name', label: 'VAT ID Name (English)' },
      { key: 'updatedAt', label: 'Rates Updated At' },
    ],
  },
}
