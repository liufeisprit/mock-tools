// api.js
import http from './http';

// 封装一个 GET 请求方法
export const getRequest = async (url, params = {}) => {
  try {
    const response = await http.get(url, { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// 封装一个 POST 请求方法
export const postRequest = async (url, data = {}) => {
  try {
    const response = await http.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// 其他请求方法（PUT, DELETE等）也可以类似封装
export const putRequest = async (url, data = {}) => {
  try {
    const response = await http.put(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteRequest = async (url, params = {}) => {
  try {
    const response = await http.delete(url, { params });
    return response;
  } catch (error) {
    throw error;
  }
};
