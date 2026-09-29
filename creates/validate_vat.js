const { BASE_URL, normalizeVatId } = require('../constants')

const perform = async (z, bundle) => {
  const vatId = normalizeVatId(bundle.inputData.vatId)

  if (!vatId) {
    throw new z.errors.Error('VAT number is empty.', 'INVALID_FORMAT', 400)
  }

  const response = await z.request({ url: `${BASE_URL}/v1/vat/${vatId}` })
  return response.data
}

module.exports = {
  key: 'validate_vat',
  noun: 'VAT Number',
  display: {
    label: 'Validate VAT Number',
    description:
      'Validates an EU VAT number against the official VIES register and returns the trader name, address and the VIES consultation number.',
  },
  operation: {
    inputFields: [
      {
        key: 'vatId',
        label: 'VAT Number',
        type: 'string',
        required: true,
        helpText:
          'Full VAT number including the country prefix, for example `DE811907980`. Spaces, dots and dashes are removed automatically.',
      },
    ],
    perform,
    sample: {
      valid: true,
      vatId: 'DE811907980',
      countryCode: 'DE',
      countryName: 'Germany',
      companyName: 'AMAZON EU S.A.R.L.',
      companyAddress: '38 AVENUE JOHN F. KENNEDY, L-1855 LUXEMBOURG',
      companyStatus: 'active',
      registryCode: null,
      taxId: null,
      consultationNumber: 'WAPIAAAAWlpaWloh',
      specialTerritory: null,
      countryVat: {
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
            de: 'Amtsgericht',
            en: 'local court',
          },
          registryName: {
            de: 'Handelsregister',
            en: 'commercial register',
          },
          registryCodeName: {
            de: 'Registernummer',
            en: 'register number',
          },
          taxIdName: {
            de: 'Wirtschafts-Identifikationsnummer',
            en: 'Business Identification Number',
          },
          vatIdName: {
            de: 'Umsatzsteuer-Identifikationsnummer',
            en: 'VAT identification number',
          },
        },
        countryVatUpdatedAt: '2026-08-11',
      },
      verifiedAt: '2026-08-14T09:12:44.518Z',
      checkId: '0198f1f0-2f5c-7c3b-9c2a-4c5f0d2a1b77',
      source: 'VIES',
    },
    outputFields: [
      { key: 'valid', label: 'Valid', type: 'boolean' },
      { key: 'vatId', label: 'VAT Number' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'countryName', label: 'Country' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'companyAddress', label: 'Company Address' },
      { key: 'companyStatus', label: 'Company Status' },
      { key: 'registryCode', label: 'Registry Code' },
      { key: 'taxId', label: 'Tax ID' },
      { key: 'consultationNumber', label: 'VIES Consultation Number' },
      { key: 'specialTerritory__name', label: 'Special Territory' },
      {
        key: 'specialTerritory__euVatArea',
        label: 'Special Territory In EU VAT Area',
        type: 'boolean',
      },
      {
        key: 'countryVat__standardRate',
        label: 'Standard VAT Rate',
        type: 'number',
      },
      { key: 'countryVat__currency', label: 'Currency' },
      { key: 'verifiedAt', label: 'Verified At', type: 'datetime' },
      { key: 'checkId', label: 'Check ID' },
      { key: 'source', label: 'Source' },
    ],
  },
}
