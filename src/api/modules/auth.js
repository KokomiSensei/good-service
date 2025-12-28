import request from '../../utils/axios';

/**
 * 认证相关API接口
 * 基于实际后端接口规范
 */

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @returns {Promise} 登录结果
 */
export const login = (credentials) => {
  const { username, password } = credentials;
  return request({
    url: `/auth/login?username=${username}&password=${password}`,
    method: 'post',
  });
};

/**
 * 用户注册
 * @param {Object} userData - 用户注册信息
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @returns {Promise} 注册结果
 */
export const register = (userData) => {
  const { username, password } = userData;
  return request({
    url: `/auth/register?username=${username}&password=${password}`,
    method: 'post',
  });
};

/**
 * 管理员注册
 * @param {Object} adminData - 管理员注册信息
 * @param {string} adminData.username - 用户名
 * @param {string} adminData.password - 密码
 * @returns {Promise} 注册结果
 */
export const registerAdmin = (adminData) => {
  const { username, password } = adminData;
  return request({
    url: `/auth/register-admin?username=${username}&password=${password}`,
    method: 'post',
  });
};