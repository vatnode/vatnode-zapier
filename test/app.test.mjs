import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const App = require('../index')
const vatEvent = require('../triggers/vat_event')

// Full schema validation runs against the compiled definition via
// `zapier validate`; these assertions cover the hand-written wiring.
describe('app definition', () => {
  it('exposes the documented operations', () => {
    expect(Object.keys(App.triggers)).toEqual(['vat_event'])
    expect(Object.keys(App.creates).sort()).toEqual(['monitor_vat', 'validate_vat'])
    expect(Object.keys(App.searches)).toEqual(['vat_rates'])
  })
})

describe('vat_event perform', () => {
  const envelope = {
    id: 'evt_1',
    version: 1,
    event: 'VAT_BECAME_INVALID',
    timestamp: '2026-08-14T06:03:11.402Z',
    data: {
      vatId: 'NL822010690B01',
      countryCode: 'NL',
      subscriptionId: 'sub_1',
    },
  }

  const run = (cleanedRequest, inputData = {}) =>
    vatEvent.operation.perform({}, { cleanedRequest, inputData })

  it('drops the verification delivery', () => {
    expect(run({ event: 'webhook.test', data: {} })).toEqual([])
  })

  it('flattens a VAT event', () => {
    const [event] = run(envelope)
    expect(event.event).toBe('VAT_BECAME_INVALID')
    expect(event.vatId).toBe('NL822010690B01')
    expect(event.subscriptionId).toBe('sub_1')
  })

  it('filters by event type', () => {
    expect(run(envelope, { eventTypes: ['COMPANY_NAME_CHANGED'] })).toEqual([])
    expect(run(envelope, { eventTypes: ['VAT_BECAME_INVALID'] })).toHaveLength(1)
  })

  it('filters by VAT number', () => {
    expect(run(envelope, { vatId: 'DE811907980' })).toEqual([])
    expect(run(envelope, { vatId: 'NL822010690B01' })).toHaveLength(1)
  })
})
