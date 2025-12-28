import request from '../../utils/axios';

/**
 * 统计相关API接口
 * 基于OpenAPI文档规范
 */

/**
 * 获取月度需求创建统计
 * @param {Object} params - 查询参数
 * @param {Array<number>} params.matchLocationIds - 匹配的位置ID数组
 * @param {Array<number>} params.matchServiceTypeIds - 匹配的服务类型ID数组
 * @param {Date|string} params.earliestCreateTime - 最早创建时间（Date对象或ISO字符串）
 * @param {Date|string} params.latestCreateTime - 最晚创建时间（Date对象或ISO字符串）
 * @returns {Promise} 月度需求创建统计数据
 */
export const getMonthlyCreationStatistics = (params = {}) => {
  const requestParams = {
    matchLocationIds: params.matchLocationIds,
    earliestCreateTime: params.earliestCreateTime,
    latestCreateTime: params.latestCreateTime,
  };
  
  return request({
    url: '/statistics/demand/creation/monthly',
    method: 'get',
    params: requestParams,
  });
};

/**
 * 获取月度需求响应统计
 * @param {Object} params - 查询参数
 * @param {Array<number>} params.matchLocationIds - 匹配的位置ID数组
 * @param {Array<number>} params.matchServiceTypeIds - 匹配的服务类型ID数组
 * @param {Date|string} params.earliestCreateTime - 最早创建时间（Date对象或ISO字符串）
 * @param {Date|string} params.latestCreateTime - 最晚创建时间（Date对象或ISO字符串）
 * @returns {Promise} 月度需求响应统计数据
 */
export const getMonthlyRespondedStatistics = (params = {}) => {
  const requestParams = {
    matchLocationIds: params.matchLocationIds || [],
    matchServiceTypeIds: params.matchServiceTypeIds || [],
    earliestCreateTime: params.earliestCreateTime,
    latestCreateTime: params.latestCreateTime,
  };
  
  return request({
    url: '/statistics/demand/responded/monthly',
    method: 'get',
    params: requestParams,
  });
};