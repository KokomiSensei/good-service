import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi, registerAdmin as registerAdminApi } from '../../api/modules/auth';
import { updateUserByPut } from '../../api/modules/user';

// 定义用户信息类型
const initialUserInfo = {
  id: null,
  username: '',
  realName: '',
  phone: '',
  biography: '',
  email: '',
  avatar: '',
  createdAt: null,
  updatedAt: null,
};

// 创建userStore
export const useUserStore = create(
  persist(
    (set, get) => ({
      // 状态
      isLoggedIn: false,
      token: null,
      userInfo: initialUserInfo,
      loading: false,
      error: null,

      // 方法
      // 登录
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          
          // 调用真实的登录API
          const apiResponse = await loginApi(credentials);
          
          // 处理API响应数据 - 支持多种可能的响应格式
          let token = null;
          let userInfo = null;
          
          // 尝试从不同可能的响应格式中提取数据
          if (typeof apiResponse === 'object' && apiResponse !== null) {
            // 格式1: { token: 'xxx', user: {...} }
            if (apiResponse.token) {
              token = apiResponse.token;
              userInfo = apiResponse.user || apiResponse.data?.user;
            }
            // 格式2: { data: { token: 'xxx', user: {...} } }
            else if (apiResponse.data?.token) {
              token = apiResponse.data.token;
              userInfo = apiResponse.data.user;
            }
            // 格式3: { accessToken: 'xxx', userInfo: {...} }
            else if (apiResponse.accessToken) {
              token = apiResponse.accessToken;
              userInfo = apiResponse.userInfo || apiResponse.user;
            }
          }
          
          // 如果没有获取到token，尝试从其他字段获取
          if (!token) {
            token = apiResponse?.accessToken || apiResponse?.auth_token || apiResponse?.data?.accessToken;
          }
          
          // 如果没有获取到用户信息，尝试从其他字段获取
          if (!userInfo) {
            userInfo = apiResponse?.userInfo || apiResponse?.data?.userInfo || apiResponse?.user || apiResponse?.data?.user;
          }
          
          // 如果仍然没有token，使用默认值
          if (!token) {
            console.warn('登录响应中没有找到token，使用临时token');
            token = 'temp-token-' + Date.now();
          }
          
          // 如果没有用户信息，创建默认用户信息
          if (!userInfo) {
            console.warn('登录响应中没有找到用户信息，创建默认用户信息');
            userInfo = {
              id: 'user-' + Date.now(),
              username: credentials.username,
              email: '',
              phone: '',
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          set({
            isLoggedIn: true,
            token: token,
            userInfo: userInfo,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '登录失败',
          });
          return false;
        }
      },

      // 注册
      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          
          // 调用真实的注册API
          const response = await registerApi(userData);
          
          // API返回格式为用户信息对象，不包含token
          const user = response.data;
          
          // 生成临时token（实际应用中可能需要后端返回token或单独的登录步骤）
          const token = 'temp-token-' + Date.now();

          set({
            isLoggedIn: true,
            token: token,
            userInfo: user,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '注册失败',
          });
          return false;
        }
      },

      // 管理员注册
      registerAdmin: async (adminData) => {
        try {
          set({ loading: true, error: null });
          
          // 调用管理员注册API
          const response = await registerAdminApi(adminData);
          
          // API返回格式为用户信息对象，不包含token
          const admin = response.useInfo;
          
          // 生成临时token（实际应用中可能需要后端返回token或单独的登录步骤）
          const token = response.token;

          set({
            isLoggedIn: true,
            token: token,
            userInfo: admin,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '管理员注册失败',
          });
          return false;
        }
      },

      // 登出
      logout: () => {
        set({
          isLoggedIn: false,
          token: null,
          userInfo: initialUserInfo,
          error: null,
        });
      },

      // 更新用户信息
      updateUserInfo: async (updates) => {
        try {
          set({ loading: true, error: null });
          
          // 调用真实的更新用户信息API
          const currentUser = get().userInfo;
          if (!currentUser?.username) {
            throw new Error('用户信息不完整，无法更新');
          }
          
          const response = await updateUserByPut(currentUser.username, updates);
          
          // 合并更新的用户信息，保留原有重要字段（如token等）
          const currentInfo = get().userInfo;
          const updatedUserData = response.data || response;
          
          // 合并用户信息，保留token和其他重要字段
          const mergedUserInfo = {
            ...currentInfo,
            ...updatedUserData,
            // 确保保留关键字段
            id: updatedUserData.id || currentInfo.id,
            username: updatedUserData.username || currentInfo.username,
            token: currentInfo.token, // 保留token，防止退出登录
            isLoggedIn: currentInfo.isLoggedIn, // 保留登录状态
          };

          set({
            userInfo: mergedUserInfo,
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('更新用户信息失败:', error);
          set({
            loading: false,
            error: error.response?.data?.message || error.message || '更新用户信息失败',
          });
          return false;
        }
      },

      // 设置认证令牌
      setToken: (token) => {
        set({ token });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      // 持久化配置
      name: 'user-storage', // 存储的键名
      partialize: (state) => ({
        // 只持久化需要的数据
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
);