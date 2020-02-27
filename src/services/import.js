import request from '@/utils/request';
 
export async function upload(params) {
    return request('/api/upload', {
        method: 'POST',
        data: params,
    })
}
export async function download(params) {
    return request('/api/download', {
        method: 'POST',
        data: params,
        responseType: 'blob'
    })
}