import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  username: string;
}

export async function login(data: LoginData) {
  const res = await api.post("token/", data);
  return res.data;
}

export async function register(data: RegisterData) {
  const res = await api.post("users/", data);
  return res.data;
}
