import request from '@/utils/request';
 
export async function query(params) {
    return request('/api/row', {
        params
    })
}
export async function add(params) {
    return request('/api/row', {
        method: 'POST',
        data: params
    })
}
export async function manyAdd(params) {
    return request('/api/many_row', {
        method: 'POST',
        data: params
    })
}
export async function remove(params) {
    return request('/api/row', {
        method: 'DELETE',
        data: params
    })
}
export async function update(params) {
    return request('/api/row', {
        method: 'PUT',
        data: params
    })
}