import { post } from './request'

// 获取osu配置信息
export const getConfig = post("/game/osu/getConfigInfo");

// 保存osu配置信息
export const saveConfig = post("/game/osu/saveConfigInfo");