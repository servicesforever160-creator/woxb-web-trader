import { AxiosRequestConfig } from "axios";
import client from "./client";

/**
 * GET Request
 */
export const get = async <T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const response = await client.get<T>(url, config);
  return response.data;
};

/**
 * POST Request
 */
export const post = async <T, D = unknown>(
  url: string,
  data?: D,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const response = await client.post<T>(url, data, config);
  return response.data;
};

/**
 * PUT Request
 */
export const put = async <T, D = unknown>(
  url: string,
  data?: D,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const response = await client.put<T>(url, data, config);
  return response.data;
};

/**
 * PATCH Request
 */
export const patch = async <T, D = unknown>(
  url: string,
  data?: D,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const response = await client.patch<T>(url, data, config);
  return response.data;
};

/**
 * DELETE Request
 */
export const del = async <T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const response = await client.delete<T>(url, config);
  return response.data;
};