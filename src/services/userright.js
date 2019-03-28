import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryUser(params) {
  return request(`/api/user?${stringify(params)}`);
}

export async function addUser(params) {
  return request('/api/user', {
    method: 'POST',
    body: params,
  });
}

export async function updateUser(params = {}) {
  return request('/api/user', {
    method: 'PUT',
    body: params,
  });
}
