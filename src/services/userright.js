import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryUser(params) {
  return request(`/api/user?${stringify(params)}`);
}

export async function addUser(params) {
  await sleep(3000);
  return request('/api/user', {
    method: 'POST',
    body: params,
  });
}

export async function updateUser(params = {}) {
  await sleep(3000);
  return request('/api/user', {
    method: 'PUT',
    body: params,
  });
}

export async function resetPwd(params) {
  await sleep(3000);
  return request('/api/user/resetpwd', {
    method: 'PUT',
    body: params,
  });
}

export async function disable(params) {
  await sleep(3000);
  return request('/api/user/disable', {
    method: 'PUT',
    body: params,
  });
}

export async function removeUsers(params) {
  await sleep(3000);
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
  await sleep(3000);
  return request(`/api/role?${stringify(params)}`);
}

export async function queryUserRole(params) {
  await sleep(3000);
  return request(`/api/userrole?${stringify(params)}`);
}

export async function setUserRole(params) {
  await sleep(3000);
  return request('/api/userrole', {
    method: 'PUT',
    body: params,
  });
}

// Sleep方法：异步方法中使用 await sleep(3000); 调用，实现阻塞
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
