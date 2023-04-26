import { get } from './request'

export const getTotal = get('/game/nft/getMemberEftInfo')

export const getWhiteList = get('/game/nft/getList')

export const getIndexImg = get('/game/nft/getIndexImg')

export const getExchangeStatus = get('/game/nft/showStatus')
