const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/api`;
const SOCKET_URL = `${BASE_URL}`;

export { API_URL, BASE_URL, SOCKET_URL };
