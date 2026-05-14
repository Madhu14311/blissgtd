export const API_URL = 'http://192.168.10.33:8080/api';

export function buildHeaders(token, extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export async function requestJson(path, { method = 'GET', token, body, headers } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(token, headers),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { response, data };
}
