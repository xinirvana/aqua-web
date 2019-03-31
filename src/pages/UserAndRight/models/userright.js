import { queryUser, addUser, updateUser, resetPwd, disable, removeUsers, removeUser, queryRole } from '@/services/userright';

export default {
  namespace: 'userright',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    roleData: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryUser, payload);
      yield put({
        type: 'save',
        payload: {
          data: response,
        }
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addUser, payload);
      yield put({
        type: 'save',
        payload: {},
      });
      if (callback) callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateUser, payload);
      yield put({
        type: 'save',
        payload: {},
      });
      if (callback) callback(response);
    },
    *resetpwd({ payload, callback }, { call, put }) {
      const response = yield call(resetPwd, payload);
      yield put({
        type: 'save',
        payload: {},
      });
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call, put }) {
      const response = yield call(disable, payload);
      yield put({
        type: 'save',
        payload: {},
      });
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeUsers, payload);
      yield put({
        type: 'save',
        payload: {},
      });
      // 
      if (callback) callback(JSON.parse(response));
    },
    *fetchRole({ payload }, { call, put }) {
      const response = yield call(queryRole, payload);
      yield put({
        type: 'save',
        payload: {
          roleData: response,
        }
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
