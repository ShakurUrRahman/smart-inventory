// lib/authApi.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handleResponse<T>(res: Response): Promise<T> {
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.message || "Something went wrong");
	}
	return data as T;
}

export async function loginUser(email: string, password: string) {
	const res = await fetch(`${API_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include", // sends/receives cookies
		body: JSON.stringify({ email, password }),
	});
	return handleResponse<{ success: boolean; token: string; user: any }>(res);
}

export async function registerUser(
	name: string,
	email: string,
	password: string,
) {
	const res = await fetch(`${API_URL}/api/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ name, email, password }),
	});
	return handleResponse<{ success: boolean; user: any }>(res);
}

export async function logoutUser() {
	const res = await fetch(`${API_URL}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});
	return handleResponse<{ success: boolean }>(res);
}

export async function getMe() {
	const res = await fetch(`${API_URL}/api/auth/me`, {
		credentials: "include",
	});
	if (!res.ok) return null;
	return res.json() as Promise<{ success: boolean; user: any } | null>;
}
