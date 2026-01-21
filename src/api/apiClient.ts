async function parseJsonResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text().catch(() => "");
  if (!response.ok) {
    const details = responseText ? ` ${responseText}` : "";
    throw new Error(`${response.status} ${response.statusText}${details}`);
  }
  return responseText ? JSON.parse(responseText) as T : {} as T;
}

export async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return parseJsonResponse<T>(response);
}

export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<T>(response);
}

export async function deleteJSON<T = any>(
  url: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const responseText = await response.text().catch(() => "");
  if (!response.ok) {
    const details = responseText ? ` ${responseText}` : "";
    throw new Error(`${response.status} ${response.statusText}${details}`);
  }
  try {
    return responseText ? JSON.parse(responseText) as T : {} as T;
  } catch {
    return {} as T;
  }
}

// Always append ?dir=<absolute path> to API URLs
export function appendProjectDir(url: string): string {
  const projectDir = localStorage.getItem("lastProjectDir") || "";
  const jobId = (globalThis as any).__USGS_WRITE_JOB_ID;

  const params: string[] = [];

  if (projectDir) {
    params.push(`dir=${encodeURIComponent(projectDir)}`);
  }

  if (jobId) {
    params.push(`jobId=${encodeURIComponent(String(jobId))}`);
  }

  if (params.length === 0) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.join("&")}`;
}
