import { queryUser, addUser, updateUser, resetPwd, disable, removeUsers, removeUser, 
  queryRole, queryUserRole, setUserRole } from '@/services/userright';

export default {
  namespace: 'userright',

  state: {
    data: {
      list: [],
      pagination: {},
    },
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
    *resetPwd({ payload, callback }, { call, put }) {
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
      // request.js DELETE默认不返回json对象
      if (callback) callback(JSON.parse(response));
    },
    *fetchRole({ payload, callback }, { call }) {
      const response = yield call(queryRole, payload);
      if (callback) callback(response);
    },
    *fetchUserRole({ payload, callback }, { call }) {
      const response = yield call(queryUserRole, payload);
      if (callback) callback(response);
    },
    *setUserRole({ payload, callback }, { call, put }) {
      const response = yield call(setUserRole, payload);
      // yield put({
      //   type: 'save',
      //   payload: {},
      // });
      if (callback) callback(response);
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
