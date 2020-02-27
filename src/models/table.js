import { query, queryTypes, queryRelations, add, remove, update } from '@/services/table';

const Model = {
  namespace: 'table',
  state: {
    data: [],
    pagination: {},
    types: {},
    relations: []
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
    *fetchTypes({ payload }, { call, put }) {
      const response = yield call(queryTypes, payload);

      yield put({
        type: 'saveTypes',
        payload: response.data || {},
      });

      return { errno: response.errno, errmsg: response.errmsg }
    },
    *fetchRelations({ payload }, { call, put }) {
      const response = yield call(queryRelations, payload);

      yield put({
        type: 'saveRelations',
        payload: response.data || [],
      })

      return { errno: response.errno, errmsg: response.errmsg }
    },
    *add({ payload }, { call, put }) {
      const response = yield call(add, payload);
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
    saveTypes(state, action) {
      return {
        ...state,
        types: action.payload,
      }
    },
    saveRelations(state, action) {
      return {
        ...state,
        relations: action.payload
      }
    },
  },
};
export default Model;
