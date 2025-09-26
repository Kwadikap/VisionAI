import axios, {
  type AxiosInstance,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getToken, getTokenIfAvailable } from '@/shared/msal';

const VISION_API_BASE =
  import.meta.env.VITE_VISION_API_BASE || 'http://localhost:8000';

function withAuth(client: AxiosInstance) {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getToken();
      if (token) {
        if (!(config.headers instanceof AxiosHeaders)) {
          config.headers = new AxiosHeaders(config.headers);
        }
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    }
  );
  return client;
}

export const visionApiPublic = axios.create({
  baseURL: VISION_API_BASE,
  withCredentials: true,
});
export const visionApi = withAuth(
  axios.create({ baseURL: VISION_API_BASE, withCredentials: true })
);

export async function optionalAuthHeaders(): Promise<Record<string, string>> {
  const token = await getTokenIfAvailable();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
