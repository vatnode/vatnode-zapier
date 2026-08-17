const { version: platformVersion } = require('zapier-platform-core')

const { version } = require('./package.json')
const authentication = require('./authentication')
const { addBearerHeader, throwOnError } = require('./middleware')

const vatEvent = require('./triggers/vat_event')
const validateVat = require('./creates/validate_vat')
const monitorVat = require('./creates/monitor_vat')
const vatRates = require('./searches/vat_rates')

module.exports = {
  version,
  platformVersion,

  authentication,

  // A VAT number is a string that Zapier's input cleaning would happily mangle
  // (leading zeros, numeric-looking values), so it is passed through untouched.
  flags: {
    cleanInputData: false,
  },

  beforeRequest: [addBearerHeader],
  afterResponse: [throwOnError],

  triggers: {
    [vatEvent.key]: vatEvent,
  },

  creates: {
    [validateVat.key]: validateVat,
    [monitorVat.key]: monitorVat,
  },

  searches: {
    [vatRates.key]: vatRates,
  },
}
