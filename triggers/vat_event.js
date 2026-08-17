const { BASE_URL, EVENT_TYPES } = require('../constants')

const subscribeHook = async (z, bundle) => {
  const created = await z.request({
    url: `${BASE_URL}/v1/webhooks`,
    method: 'POST',
    body: { url: bundle.targetUrl },
  })

  // A vatnode webhook is created unverified and only starts delivering once a
  // test call to the endpoint succeeds, so the test is fired right away.
  await z.request({
    url: `${BASE_URL}/v1/webhooks/${created.data.id}/test`,
    method: 'POST',
  })

  return created.data
}

const unsubscribeHook = async (z, bundle) => {
  const response = await z.request({
    url: `${BASE_URL}/v1/webhooks/${bundle.subscribeData.id}`,
    method: 'DELETE',
    skipThrowForStatus: true,
  })
  return response.data || {}
}

const flatten = (envelope) => ({
  id: envelope.id,
  event: envelope.event,
  timestamp: envelope.timestamp,
  vatId: (envelope.data && envelope.data.vatId) || null,
  subscriptionId: (envelope.data && envelope.data.subscriptionId) || null,
  ...(envelope.data || {}),
})

const perform = (z, bundle) => {
  const envelope = bundle.cleanedRequest

  // The verification delivery fired by performSubscribe is not a VAT event.
  if (!envelope || envelope.event === 'webhook.test') return []

  const wanted = bundle.inputData.eventTypes
  if (wanted && wanted.length && wanted.indexOf(envelope.event) === -1) return []

  const vatId = bundle.inputData.vatId
  if (vatId && envelope.data && envelope.data.vatId !== vatId) return []

  return [flatten(envelope)]
}

/**
 * Zapier needs sample data when no live event has arrived yet. vatnode stores
 * event history per monitored VAT number, so the most recent events of the
 * first few subscriptions are replayed here.
 */
const performList = async (z) => {
  const subs = await z.request({ url: `${BASE_URL}/v1/subscriptions` })
  const list = (subs.data.subscriptions || []).slice(0, 5)

  const batches = await Promise.all(
    list.map((sub) =>
      z
        .request({ url: `${BASE_URL}/v1/subscriptions/${sub.id}/events` })
        .then((r) => (r.data.events || []).map((e) => ({ ...e, vatId: sub.vatId })))
        .catch(() => []),
    ),
  )

  return batches
    .reduce((all, batch) => all.concat(batch), [])
    .map((e) => ({
      id: e.id,
      event: e.type,
      timestamp: e.createdAt,
      vatId: e.vatId,
      ...(e.payload || {}),
    }))
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
}

module.exports = {
  key: 'vat_event',
  noun: 'VAT Event',
  display: {
    label: 'VAT Number Changed',
    description:
      'Triggers when a monitored EU VAT number stops being valid, becomes valid again, or the trader name or address changes in VIES.',
  },
  operation: {
    type: 'hook',
    inputFields: [
      {
        key: 'eventTypes',
        label: 'Event Types',
        type: 'string',
        list: true,
        required: false,
        choices: EVENT_TYPES,
        helpText: 'Leave empty to receive every event type.',
      },
      {
        key: 'vatId',
        label: 'VAT Number',
        type: 'string',
        required: false,
        helpText:
          'Restrict the trigger to a single monitored VAT number. Leave empty to receive events for all of them.',
      },
    ],
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    perform,
    performList,
    sample: {
      id: '0198f1f0-2f5c-7c3b-9c2a-4c5f0d2a1b77',
      event: 'VAT_BECAME_INVALID',
      timestamp: '2026-08-14T06:03:11.402Z',
      vatId: 'NL822010690B01',
      previousValid: true,
      newValid: false,
    },
    outputFields: [
      { key: 'id', label: 'Event ID' },
      { key: 'event', label: 'Event Type' },
      { key: 'timestamp', label: 'Occurred At', type: 'datetime' },
      { key: 'vatId', label: 'VAT Number' },
    ],
  },
}
