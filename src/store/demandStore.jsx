import { create } from "zustand";
import { persist } from "zustand/middleware";

// 模拟初始需求数据
const mockDemands = [
  {
    id: "1",
    userId: "user-1",
    type: "管道维修",
    title: "卫生间水管漏水",
    description: "卫生间洗手池下水管漏水严重，需要维修",
    status: "待处理",
    createTime: "2024-01-15T10:30:00",
    updateTime: "2024-01-15T10:30:00",
    address: "幸福小区1号楼3单元502室",
  },
  {
    id: "2",
    userId: "user-2",
    type: "助老服务",
    title: "老人陪护服务",
    description: "每周一、三、五下午需要陪护老人",
    status: "处理中",
    createTime: "2024-01-14T14:20:00",
    updateTime: "2024-01-15T09:15:00",
    address: "阳光家园2号楼2单元301室",
  },
  {
    id: "3",
    userId: "user-1",
    type: "保洁服务",
    title: "家庭保洁",
    description: "需要全屋深度保洁，包括厨房和卫生间",
    status: "已完成",
    createTime: "2024-01-13T09:10:00",
    updateTime: "2024-01-14T16:45:00",
    address: "和谐社区3号楼1单元201室",
  },
  {
    id: "4",
    userId: "user-3",
    type: "就诊服务",
    title: "陪同就医",
    description: "需要陪同老人到医院就诊，帮忙挂号和取药",
    status: "待处理",
    createTime: "2024-01-15T08:45:00",
    updateTime: "2024-01-15T08:45:00",
    address: "安康小区4号楼5单元602室",
  },
  {
    id: "5",
    userId: "user-1",
    type: "营养餐服务",
    title: "老人营养餐",
    description: "需要为老人提供每日营养餐配送服务",
    status: "处理中",
    createTime: "2024-01-12T11:20:00",
    updateTime: "2024-01-14T10:30:00",
    address: "福寿园5号楼3单元401室",
  },
  {
    id: "6",
    userId: "user-2",
    type: "定期接送服务",
    title: "接送孩子上学",
    description: "需要每天接送孩子上下学",
    status: "已完成",
    createTime: "2024-01-11T16:15:00",
    updateTime: "2024-01-13T17:20:00",
    address: "希望小学附近",
  },
];

// 模拟服务响应数据
const mockServiceResponses = [
  {
    id: "1",
    demandId: "1",
    userId: "user-2",
    content: "我有3年管道维修经验，可以明天下午上门",
    status: "待审核",
    responseTime: "2024-01-15T11:00:00",
    demandTitle: "卫生间水管漏水",
    serviceType: "管道维修",
    demandStatus: "待处理",
  },
  {
    id: "2",
    demandId: "4",
    userId: "user-1",
    content: "我可以提供陪同就医服务，有多年照顾老人经验",
    status: "已接受",
    responseTime: "2024-01-15T09:00:00",
    demandTitle: "陪同就医",
    serviceType: "就诊服务",
    demandStatus: "待处理",
  },
];

// 服务类型列表
const serviceTypes = [
  "管道维修",
  "助老服务",
  "保洁服务",
  "就诊服务",
  "营养餐服务",
  "定期接送服务",
];

export const useDemandStore = create(
  persist(
    (set, get) => ({
      // 状态
      demands: mockDemands,
      filteredDemands: mockDemands,
      currentDemand: null,
      loading: false,
      error: null,
      filterType: "all",
      searchKeyword: "",
      pagination: {
        current: 1,
        pageSize: 10,
        total: mockDemands.length,
      },
      serviceTypes: serviceTypes,
      serviceResponses: mockServiceResponses,
      myServiceResponses: [], // 用户的服务响应列表

      // 方法
      // 获取所有需求
      getAllDemands: () => {
        set({ filteredDemands: get().demands });
      },

      // 按类型筛选需求
      filterByType: (type) => {
        const { demands, searchKeyword } = get();
        set({ filterType: type });

        let filtered = demands;
        if (type !== "all") {
          filtered = demands.filter((demand) => demand.type === type);
        }

        if (searchKeyword) {
          filtered = filtered.filter(
            (demand) =>
              demand.title.includes(searchKeyword) ||
              demand.description.includes(searchKeyword)
          );
        }

        set({
          filteredDemands: filtered,
          pagination: {
            ...get().pagination,
            total: filtered.length,
            current: 1,
          },
        });
      },

      // 按用户ID筛选需求
      filterByUserId: (userId) => {
        const { demands, filterType, searchKeyword } = get();

        let filtered = demands;
        if (userId) {
          // 先尝试按userId筛选
          const userFiltered = demands.filter(
            (demand) => demand.userId === userId
          );
          // 如果筛选结果为空，则返回所有数据
          filtered = userFiltered.length > 0 ? userFiltered : demands;
        }

        if (filterType !== "all") {
          filtered = filtered.filter((demand) => demand.type === filterType);
        }

        if (searchKeyword) {
          filtered = filtered.filter(
            (demand) =>
              demand.title.includes(searchKeyword) ||
              demand.description.includes(searchKeyword)
          );
        }

        set({
          filteredDemands: filtered,
          pagination: {
            ...get().pagination,
            total: filtered.length,
            current: 1,
          },
        });
      },

      // 搜索需求
      searchDemands: (keyword) => {
        const { demands, filterType } = get();
        set({ searchKeyword: keyword });

        let filtered = demands;
        if (filterType !== "all") {
          filtered = demands.filter((demand) => demand.type === filterType);
        }

        if (keyword) {
          filtered = filtered.filter(
            (demand) =>
              demand.title.includes(keyword) ||
              demand.description.includes(keyword) ||
              demand.address.includes(keyword)
          );
        }

        set({
          filteredDemands: filtered,
          pagination: {
            ...get().pagination,
            total: filtered.length,
            current: 1,
          },
        });
      },

      // 分页处理
      handlePaginationChange: (page, pageSize) => {
        set({
          pagination: {
            ...get().pagination,
            current: page,
            pageSize: pageSize,
          },
        });
      },

      // 获取单个需求详情
      getDemandById: (id) => {
        const demand = get().demands.find((d) => d.id === id);
        set({ currentDemand: demand });
        return demand;
      },

      // 创建新需求
      createDemand: (demandData) => {
        const newDemand = {
          id: Date.now().toString(),
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          status: "待处理",
          ...demandData,
        };

        const updatedDemands = [...get().demands, newDemand];
        set({ demands: updatedDemands });
        get().filterByType(get().filterType); // 重新应用筛选
        return newDemand;
      },

      // 更新需求
      updateDemand: (id, updateData) => {
        const updatedDemands = get().demands.map((demand) =>
          demand.id === id
            ? { ...demand, ...updateData, updateTime: new Date().toISOString() }
            : demand
        );

        set({ demands: updatedDemands });
        get().filterByType(get().filterType); // 重新应用筛选

        // 更新当前选中的需求
        if (get().currentDemand?.id === id) {
          set({
            currentDemand: {
              ...get().currentDemand,
              ...updateData,
              updateTime: new Date().toISOString(),
            },
          });
        }
      },

      // 删除需求
      deleteDemand: (id) => {
        const updatedDemands = get().demands.filter(
          (demand) => demand.id !== id
        );
        set({ demands: updatedDemands });
        get().filterByType(get().filterType); // 重新应用筛选

        // 如果删除的是当前选中的需求，清空currentDemand
        if (get().currentDemand?.id === id) {
          set({ currentDemand: null });
        }
      },

      // 重置筛选和搜索
      resetFilters: () => {
        set({
          filterType: "all",
          searchKeyword: "",
          pagination: { ...get().pagination, current: 1 },
        });
        get().getAllDemands();
      },

      // 获取当前用户的所有服务响应
      getMyServiceResponses: (userId) => {
        const { serviceResponses, demands } = get();

        // 获取当前用户的所有响应
        const myResponses = serviceResponses.filter(
          (response) => response.userId === userId
        );

        // 为每个响应添加需求信息
        const responsesWithDemandInfo = myResponses.map((response) => {
          const demand = demands.find((d) => d.id === response.demandId);
          return {
            ...response,
            demandTitle: demand?.title || "未知需求",
            serviceType: demand?.type || "未知类型",
            demandStatus: demand?.status || "未知状态",
          };
        });

        set({ myServiceResponses: responsesWithDemandInfo });
        return responsesWithDemandInfo;
      },

      // 创建新的服务响应
      createServiceResponse: (responseData) => {
        const { serviceResponses, demands } = get();
        const demand = demands.find((d) => d.id === responseData.demandId);

        const newResponse = {
          id: Date.now().toString(),
          responseTime: new Date().toISOString(),
          status: "待审核",
          demandTitle: demand?.title || "未知需求",
          serviceType: demand?.type || "未知类型",
          demandStatus: demand?.status || "未知状态",
          ...responseData,
        };

        const updatedResponses = [...serviceResponses, newResponse];
        set({ serviceResponses: updatedResponses });

        // 如果当前用户正在查看自己的响应，也更新myServiceResponses
        if (get().myServiceResponses.length > 0) {
          get().getMyServiceResponses(responseData.userId);
        }

        return newResponse;
      },

      // 更新服务响应
      updateServiceResponse: (id, updateData) => {
        const { serviceResponses } = get();

        const updatedResponses = serviceResponses.map((response) =>
          response.id === id ? { ...response, ...updateData } : response
        );

        set({ serviceResponses: updatedResponses });

        // 更新myServiceResponses
        const userId = updatedResponses.find((r) => r.id === id)?.userId;
        if (userId) {
          get().getMyServiceResponses(userId);
        }

        return updatedResponses;
      },

      // 删除服务响应
      deleteMyServiceResponse: (id) => {
        const { serviceResponses } = get();

        const updatedResponses = serviceResponses.filter(
          (response) => response.id !== id
        );
        set({ serviceResponses: updatedResponses });

        // 更新myServiceResponses
        const deletedResponse = serviceResponses.find((r) => r.id === id);
        if (deletedResponse?.userId) {
          get().getMyServiceResponses(deletedResponse.userId);
        }

        return updatedResponses;
      },
    }),
    { name: "demand-storage" }
  )
);
