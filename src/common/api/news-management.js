import { get, post } from './request'

export const getList = post('/game/News/index')

export const getNewsDetail = get('/game/News/view')

export const postUploadFile = post('/game/News/upload')

export const addNews = post('/game/News/add')

export const editNews = post('/game/News/update')
