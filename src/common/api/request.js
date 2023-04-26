import axios from 'axios'
import { Message } from 'element-ui'

const testHost = 'https://musictest.muverse.info'
const prodHost = 'https://music.muverse.info'
const isDev = process.env.NODE_ENV === 'development'

function getGlobalParams() {
  return {
    wallet: JSON.parse(localStorage.getItem("muser") || "{}").UserLoginRespMsg
      ?.wallet,
  };
}

async function request(url, method, params) {
  const query = {
    url,
    method,
  };

  if (params?.headers) {
    query.headers = params.headers;
    delete params.headers;
  }

  if (method === "GET") {
    query.params = {
      ...params,
      ...getGlobalParams(),
    };
  }
  // 区分测试和正式环境
  if (window.location.host.includes("admin.muverse")) {
    query.url = `${prodHost}${query.url}`;
  } else {
    query.url = `${testHost}${query.url}`;
  }

  if (method === "POST") {
    if (params?.data instanceof FormData) {
      params.data.append("wallet", getGlobalParams().wallet);
      query.data = params.data;
    } else {
      query.data = params.data || {
        ...params,
        ...getGlobalParams(),
      };
    }
  }
  const res = await axios(query);

  if (isDev) {
    console.log("query-params ->", query);
    console.log("query-res ->", res);
  }

  const { data, status } = res;

  if (status !== 200) {
    Message.error("NetWork Error");
    return null;
  }

  if (data.code && data.code !== 200) {
    data.msg && Message.error(data.msg);
    return null;
  }

  return data.data !== undefined ? data.data : data;
}

export function get(url) {
  return function (params) {
    return request(url, 'GET', params)
  }
}

export function post(url) {
  return function (params) {
    return request(url, 'POST', params)
  }
}
