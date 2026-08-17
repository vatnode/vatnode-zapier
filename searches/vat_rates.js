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
          'Two-letter country code as used by VIES, for example `DE`, `FR` or `EL` for Greece.',
      },
    ],
    perform,
    sample: {
      countryCode: 'DE',
      countryName: 'Germany',
      isEU: true,
      vatName: 'Umsatzsteuer',
      vatAbbr: 'USt',
      standardRate: 19,
      reducedRates: [7],
      superReducedRate: null,
      parkingRate: null,
      vatNumberFormat: 'DE999999999',
      vatNumberPattern: '^DE[0-9]{9}$',
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
      { key: 'vatNumberFormat', label: 'VAT Number Format' },
      { key: 'updatedAt', label: 'Rates Updated At' },
    ],
  },
}
