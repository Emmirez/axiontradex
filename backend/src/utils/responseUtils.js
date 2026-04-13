export const successResponse = (res, statusCode = 200, message, data = {}) => {
  return res.status(statusCode).json({ success: true, message, data })
}

export const errorResponse = (res, statusCode = 500, message, errors = null) => {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return res.status(statusCode).json(body)
}

export const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({ success: true, message, data, pagination })
}