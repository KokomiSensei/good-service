// 请求拦截器
export const requestInterceptor = (config) => {
  // 从本地存储获取token（不直接使用useStore避免hook调用限制）
  const token = localStorage.getItem('user-storage') ? 
    JSON.parse(localStorage.getItem('user-storage')).token : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

export const requestErrorHandler = (error) => {
  return Promise.reject(error);
};
