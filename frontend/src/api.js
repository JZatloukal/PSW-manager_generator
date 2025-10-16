import { API_URL } from "./config";

// Funkce pro GET požadavky
export async function getRequest(endpoint, token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const response = await fetch(`${API_URL}${endpoint}`, { headers });
  return await response.json();
}

// Funkce pro POST požadavky
export async function postRequest(endpoint, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return await response.json();
}

// Funkce pro PUT požadavky
export async function putRequest(endpoint, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  return await response.json();
}

// Funkce pro DELETE požadavky
export async function deleteRequest(endpoint, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });
  return await response.json();
}
