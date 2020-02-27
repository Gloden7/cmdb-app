import request from '@/utils/request';
 
export async function query(params) {
    return request('/api/column', {
        params
    })
}
export async function add(params) {
    return request('/api/column', {
        method: 'POST',
        data: params
    })
}
export async function remove(params) {
    return request('/api/column', {
        method: 'DELETE',
        data: params
    })
}
export async function update(params) {
    return request('/api/column', {
        method: 'PUT',
        data: params
    })
}