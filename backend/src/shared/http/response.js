export function sendSuccess(response, data, statusCode = 200, meta = undefined) {
  const payload = {
    success: true,
    data
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return response.status(statusCode).json(payload);
}
