import request from '@/utils/request';
 
export async function query(params) {
    return request('/api/table', {
        params
    })
}
export async function queryTypes(params) {
    return request('/api/types', {
        params
    })
}
export async function queryRelations(params) {
    return request('/api/relations', {
        params
    })
}
export async function add(params) {
    return request('/api/table', {
        method: 'POST',
        data: params
    })
}
export async function remove(params) {
    return request('/api/table', {
        method: 'DELETE',
        data: params
    })
}
export async function update(params) {
    return request('/api/table', {
        method: 'PUT',
        data: params
    })
}