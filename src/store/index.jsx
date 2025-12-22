import { create } from 'zustand';
import { useUserStore } from './userStore';
import { useDemandStore } from './demandStore';

// 定义一个基础的store（如果需要）
export const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// 导出所有store
export { useUserStore, useDemandStore };
