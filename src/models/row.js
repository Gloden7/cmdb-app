import { query, add, manyAdd, remove, update } from '@/services/row';

const Model = {
  namespace: 'row',
  state: {
    data: [],
    pagination: {},
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);

      yield put({
        type: 'save',
        payload: response.data || {},
      });

      return { errno: response.errno, errmsg: response.errmsg }
    },
    *add({ payload }, { call, put }) {
      const response = yield call(add, payload);
      return { errno: response.errno, errmsg: response.errmsg }
    },
    *manyAdd({ payload }, { call, put }) {
      const response = yield call(manyAdd, payload);
      return { errno: response.errno, errmsg: response.errmsg }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(remove, payload);
      return { errno: response.errno, errmsg: response.errmsg }
    },
    *update({ payload }, { call, put }) {
      const response = yield call(update, payload)
      return { errno: response.errno, errmsg: response.errmsg }
    }
  },
  reducers: {
    save(state, action) {
      return { 
          ...state, 
          data: action.payload.data || [],
          pagination: action.payload.pagination || {},
      }
    },
  },
};
export default Model;
