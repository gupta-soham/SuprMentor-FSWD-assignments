const API = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export const shortenUrl = (url) =>
  request("/shorten", { method: "POST", body: JSON.stringify({ url }) });

export const listUrls = (page = 1, limit = 20) =>
  request(`/urls?page=${page}&limit=${limit}`);

export const getStats = (code) => request(`/urls/${code}/stats`);

export const deleteUrl = (code) =>
  request(`/urls/${code}`, { method: "DELETE" });
