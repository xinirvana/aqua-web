import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryUserList(params) {
  return request(`/api/user?${stringify(params)}`);
}
