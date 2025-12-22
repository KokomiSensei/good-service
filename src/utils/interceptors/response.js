import { message } from 'antd';

// 响应拦截器
export const responseInterceptor = (response) => {
  return response.data;
};

export const responseErrorHandler = (error) => {
  // 处理网络错误
  if (!error.response) {
    message.error('网络连接失败，请检查网络设置');
    return Promise.reject(new Error('网络连接失败'));
  }
  
  // 处理不同状态码
  const status = error.response.status;
  const data = error.response.data;
  
  switch (status) {
    case 400:
      message.error(data.message || '请求参数错误');
      break;
    case 401:
      message.error('登录已过期，请重新登录');
      // 清除用户状态
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-storage');
        window.location.href = '/login';
      }
      break;
    case 403:
      message.error('没有权限访问该资源');
      break;
    case 404:
      message.error('请求的资源不存在');
      break;
    case 500:
      message.error('服务器内部错误');
      break;
    default:
      message.error(data.message || `请求失败 (${status})`);
  }
  
  return Promise.reject(error);
};
