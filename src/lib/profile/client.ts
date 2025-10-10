export async function postHealthProfile(body: Record<string, unknown>): Promise<Response> {
  return fetch('/api/health', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}


