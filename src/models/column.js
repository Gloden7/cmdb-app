import { query, add, remove, update } from '@/services/column';

const Model = {
  namespace: 'column',
  state: {
    data: [],
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      
      yield put({
        type: 'save',
        payload: response.data || [],
      });

      return { errno: response.errno, errmsg: response.errmsg }
    },
    *add({ payload }, { call, put }) {
      const response = yield call(add, payload);
      return { errno: response.errno, errmsg: response.errmsg }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(remove, payload)
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
        data: action.payload,
      }
    },
  },
};
export default Model;
