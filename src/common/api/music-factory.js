import { get, post } from './request'

export const getDashBoard = post("/game/data_board/gameEntrance");

export const getMusicTypes = get('/game/song/getMusicTypeList')

export const getArtistSugList = get('/game/song/getAuthors')

export const getIsArtistExist = get('/game/song/getMusicExistsState')

export const postAddMusic = post('/game/song/addMusic')

export const postEditAuthor = post('/game/song/updateMusicAuthor')

export const getMusicList = get('/game/song/getMusicList')

export const postUploadFile = post('/game/song/uploadFile')

export const getCountries = get('/game/song/getNationalityList')

export const postEditMusic = post('/game/song/updateMusic')

export const getOSUText = get('/game/song/getOsuList')

export const postEditOSU = post('/game/song/saveOsu')
