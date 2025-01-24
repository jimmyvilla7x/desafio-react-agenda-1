import axios, { AxiosResponse } from 'axios';
import { IUser } from '../types/UserTypes';

const API_BASE_URL = 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data || error.message;
  }
  return 'Ocurrió un error inesperado';
};

export const getUsers = async (
  page: number,
  limit: number,
  searchQuery?: string
): Promise<{ data: IUser[]; total: number }> => {
  try {
    const { data, headers }: AxiosResponse = await api.get('/users', {
      params: { _page: page, _limit: limit, q: searchQuery },
    });
    const total = parseInt(headers['x-total-count'], 10);
    return { data, total };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getUser = async (id: number): Promise<IUser> => {
  try {
    const { data }: AxiosResponse = await api.get(`/users/${id}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const createUser = async (user: IUser): Promise<IUser> => {
  try {
    const { data }: AxiosResponse = await api.post('/users', user);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteUser = async (id: number): Promise<IUser> => {
  try {
    const { data }: AxiosResponse = await api.delete(`/users/${id}`);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};