import { upload, download } from '@/services/import';
import { message } from 'antd'

const Model = {
  namespace: 'excel',
  state: {
    data: [],
    pagination: {},
  },
  effects: {
    *upload({ payload }, { call, put }) {
      const response = yield call(upload, payload);
      return { errno: response.errno, errmsg: response.errmsg }
    },
    *download({ payload, callback }, { call, put }) {
      const response = yield call(download, payload);
      if (response && response instanceof Blob) {
        callback(response)
      }else {
        message.error(`${response.errno}, ${response.errmsg}.`)
      }
    },  
  },
  reducers: {
  },
};
export default Model;
