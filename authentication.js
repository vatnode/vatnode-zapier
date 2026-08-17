const { BASE_URL } = require('./constants')

const test = (z) => z.request({ url: `${BASE_URL}/v1/key` }).then((response) => response.data)

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'password',
      helpText:
        'Create a key in your [vatnode dashboard](https://vatnode.dev/dashboard/api-keys). Live keys start with `vat_live_`, test keys with `vat_test_`.',
    },
  ],
  test,
  connectionLabel: '{{label}} ({{environment}})',
}
