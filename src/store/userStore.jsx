import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义用户信息类型
const initialUserInfo = {
  id: null,
  username: '',
  email: '',
  phone: '',
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
          
          // 这里可以替换为实际的API调用
          // const response = await api.login(credentials);
          
          // 模拟API响应
          const mockResponse = {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 'user-1', // 使用固定的userId，与mock数据匹配
              username: credentials.username,
              email: '',
              phone: '',
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };

          set({
            isLoggedIn: true,
            token: mockResponse.token,
            userInfo: mockResponse.user,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.message || '登录失败',
          });
          return false;
        }
      },

      // 注册
      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          
          // 这里可以替换为实际的API调用
          // const response = await api.register(userData);
          
          // 模拟API响应
          const mockResponse = {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 'user-' + Date.now(),
              username: userData.username,
              email: userData.email,
              phone: userData.phone,
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };

          set({
            isLoggedIn: true,
            token: mockResponse.token,
            userInfo: mockResponse.user,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.message || '注册失败',
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
          
          // 这里可以替换为实际的API调用
          // const response = await api.updateUser(updates);
          
          // 模拟API响应
          const updatedUser = {
            ...get().userInfo,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          set({
            userInfo: updatedUser,
            loading: false,
          });

          return true;
        } catch (error) {
          set({
            loading: false,
            error: error.message || '更新用户信息失败',
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
