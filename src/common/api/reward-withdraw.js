import { get, post } from './request'


export const getList = get('/game/invite/orderList')

export const getItemInfo = get('/game/invite/orderDetail')

export const getGatherInfo = get('/game/invite/checkTotalInfo')

export const postConfirm = post('/game/invite/orderCheck')
