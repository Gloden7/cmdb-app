import { query } from '@/services/value';

const Model = {
  namespace: 'value',
  state: {
    data: {},
    pagination: {}
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      yield put({
        type: 'save',
        name: payload.name,
        payload: response.data || {},
      });
      return { errno: response.errno, errmsg: response.errmsg }
    },
    *append({ payload }, { call, put }) {
        const response = yield call(query, payload);
        yield put({
          type: 'append',
          name: payload.name,
          payload: response.data || {},
        });
        return { errno: response.errno, errmsg: response.errmsg }
    },
    
  },
  reducers: {
    save(state, action) {
      return { 
        ...state, 
        data: { ...state.data, [action.name]: action.payload.data },
        pagination: { ...state.pagination, [action.name]: action.payload.pagination}
      }
    },
    append(state, action) {
      return {
          ...state,
          data: {...state.data, [action.name]: state.data[action.name].push(...action.payload.data)},
          pagination: { ...state.pagination, [action.name]: action.payload.pagination}
      }
    }
  },
};
export default Model;
