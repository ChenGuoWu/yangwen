import axios from 'axios';
import Vue from 'vue';

axios.defaults.baseURL = '';
axios.defaults.timeout = 20000;

/**
 * 在请求或响应被 then 或 catch 处理前拦截它们。
 * 添加请求拦截器
 * */
axios.interceptors.request.use(
  function(config) {
	if (sessionStorage.getItem('cookie')) {  // 判断是否存在用户信息，如果存在的话，则每个http header都加上用户账号
		config.headers.account = sessionStorage.getItem('cookie');
	}
    return config;
  },
  function(error) {
    // 请求错误做些什么
    console.log(error);
  }
);

/**
 * 添加响应拦截器
 * */
axios.interceptors.response.use(
  function(response) {
	if(response.headers.cookie){
		sessionStorage.setItem('cookie', response.headers.cookie);
	}
    // 对响应数据做些什么
    return response.data;
  },
  function(error) {
    // 对响应错误做些什么
    console.log(error);
  }
);

const request ={};
request.get = function(url, data, conf = {}, needLoading = false) {
  return axios
    .get(url, Object.assign({ params: data }, conf))
    .catch(function(thrown) {
      if (axios.isCancel(thrown)) {
        console.log('Request canceled');
      } else {
        // handle error
      }
    })
    .finally(() => {
		
    });
};

request.post = (url, data, conf = {}, needLoading = false) => {
  return axios
    .post(url, data, conf)
    .catch(thrown => {
      if (axios.isCancel(thrown)) {
        console.log('Request canceled');
      } else {
        // handle error
      }
    })
    .finally(() => {
		
    });
};

export default request;
