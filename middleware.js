/**
 * Every vatnode endpoint authenticates with `Authorization: Bearer <key>`,
 * so the header is attached centrally instead of in each operation.
 */
const addBearerHeader = (request, z, bundle) => {
  if (bundle.authData.apiKey) {
    request.headers = request.headers || {}
    request.headers.Authorization = `Bearer ${bundle.authData.apiKey}`
  }
  return request
}

/**
 * vatnode returns errors as `{ error: { code, message, requestId } }`.
 * Surfacing that message keeps the Zap history readable instead of showing a
 * raw status code.
 */
const throwOnError = (response, z) => {
  if (response.status < 400) return response

  // Operations that handle a status themselves (404 as "no match", 409 as
  // "already monitored") opt out with skipThrowForStatus.
  if (response.request && response.request.skipThrowForStatus) return response

  const message = response.data && response.data.error && response.data.error.message
  const code = response.data && response.data.error && response.data.error.code

  if (response.status === 401 || response.status === 403) {
    throw new z.errors.ExpiredAuthError(message || 'Your vatnode API key was rejected.')
  }

  throw new z.errors.Error(
    message || `vatnode returned HTTP ${response.status}`,
    code,
    response.status,
  )
}

module.exports = { addBearerHeader, throwOnError }
