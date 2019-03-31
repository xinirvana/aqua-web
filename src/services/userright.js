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
  //await sleep(3000);
  return request('/api/user', {
    method: 'PUT',
    body: params,
  });
}

export async function resetPwd(params) {
  return request('/api/user/resetpwd', {
    method: 'PUT',
    body: params,
  });
}

export async function disable(params) {
  return request('/api/user/disable', {
    method: 'PUT',
    body: params,
  });
}

export async function removeUsers(params) {
  return request('/api/user', {
    method: 'DELETE',
    body: params,
  });
}

export async function removeUser(id) {
  return request('/api/user/' + id, {
    method: 'DELETE',
  });
}

export async function queryRole(params) {
  return request(`/api/role?${stringify(params)}`);
}

// Sleep方法：异步方法中使用 await sleep(3000); 调用，实现阻塞
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
