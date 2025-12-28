/**
 * 时间处理工具函数
 * 专门处理ISO 8601格式的时间字符串，包含微秒的处理和时区转换
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 解析ISO 8601时间字符串（支持微秒）
 * @param {string} timeString - ISO 8601格式的时间字符串
 * @param {string} targetTimezone - 目标时区，默认'Asia/Shanghai'
 * @returns {dayjs.Dayjs} 解析后的dayjs对象
 */
export const parseISOTime = (timeString, targetTimezone = 'Asia/Shanghai') => {
  if (!timeString) return null;
  
  try {
    // 处理微秒格式：移除多余的位数，只保留毫秒
    const cleaned = timeString.replace(/\.(\d{3})\d+/, '.$1');
    
    // 解析为UTC时间，然后转换为目标时区
    return dayjs.utc(cleaned).tz(targetTimezone);
  } catch (error) {
    console.warn('时间解析失败:', error, '原始时间:', timeString);
    return dayjs(); // 返回当前时间作为fallback
  }
};

/**
 * 格式化时间显示
 * @param {string} timeString - ISO 8601格式的时间字符串
 * @param {string} format - 格式化模式，默认'YYYY-MM-DD HH:mm:ss'
 * @param {string} timezone - 时区，默认'Asia/Shanghai'
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (timeString, format = 'YYYY-MM-DD HH:mm:ss', timezone = 'Asia/Shanghai') => {
  const parsed = parseISOTime(timeString, timezone);
  return parsed ? parsed.format(format) : '未知时间';
};

/**
 * 格式化时间为本地显示格式
 * @param {string} timeString - ISO 8601格式的时间字符串
 * @returns {string} 本地化的时间字符串
 */
export const formatLocalTime = (timeString) => {
  if (!timeString) return '未知时间';
  
  try {
    // 处理微秒并转换为本地时间
    const cleaned = timeString.replace(/\.(\d{3})\d+/, '.$1');
    const date = new Date(cleaned);
    
    // 使用浏览器本地时区显示
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('本地时间格式化失败:', error);
    return timeString;
  }
};

/**
 * 批量处理对象中的时间字段
 * @param {Object} obj - 包含时间字段的对象
 * @param {Array} timeFields - 时间字段名数组
 * @param {string} format - 格式化模式
 * @returns {Object} 处理后的对象
 */
export const processTimeFields = (obj, timeFields = ['createdAt', 'modifiedAt', 'startTime', 'endTime'], format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const processed = { ...obj };
  
  timeFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      processed[field] = formatTime(processed[field], format);
    }
  });
  
  return processed;
};

/**
 * 获取相对时间描述（如：3小时前、2天前）
 * @param {string} timeString - ISO 8601格式的时间字符串
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (timeString) => {
  const parsed = parseISOTime(timeString);
  if (!parsed) return '未知时间';
  
  const now = dayjs();
  const diffMinutes = now.diff(parsed, 'minute');
  const diffHours = now.diff(parsed, 'hour');
  const diffDays = now.diff(parsed, 'day');
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  
  return parsed.format('YYYY-MM-DD');
};

// 默认导出
export default {
  parseISOTime,
  formatTime,
  formatLocalTime,
  processTimeFields,
  getRelativeTime
};