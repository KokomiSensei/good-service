// 请求拦截器
export const requestInterceptor = (config) => {
  console.log('🚀 请求拦截器 - 发起请求:', config.method?.toUpperCase(), config.url);
  
  // 从本地存储获取token（不直接使用useStore避免hook调用限制）
  try {
    const userStorage = localStorage.getItem('user-storage');
    if (userStorage) {
      const userData = JSON.parse(userStorage);
      const token = userData?.state?.token;
      
      if (token && typeof token === 'string' && token.trim()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('解析用户存储数据失败:', error);
    // 如果解析失败，不清空localStorage，避免误删用户数据
  }
  
  return config;
};

export const requestErrorHandler = (error) => {
  return Promise.reject(error);
};