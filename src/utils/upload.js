import axios from './axios';

/**
 * 文件上传工具模块
 * 支持图片、视频和文字上传
 */

// 上传配置
const uploadConfig = {
  // 文件大小限制（50MB）
  maxFileSize: 50 * 1024 * 1024,
  // 支持的图片类型
  imageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  // 支持的视频类型
  videoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
};

/**
 * 检查文件类型是否允许
 * @param {File} file - 要检查的文件
 * @param {Array} allowedTypes - 允许的文件类型数组
 * @returns {boolean} - 是否允许上传
 */
const checkFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * 检查文件大小是否允许
 * @param {File} file - 要检查的文件
 * @param {number} maxSize - 最大允许大小（字节）
 * @returns {boolean} - 是否允许上传
 */
const checkFileSize = (file, maxSize = uploadConfig.maxFileSize) => {
  return file.size <= maxSize;
};

/**
 * 上传单个文件
 * @param {File} file - 要上传的文件
 * @param {Object} options - 上传选项
 * @param {string} options.type - 文件类型：'image' 或 'video'
 * @param {Function} options.onProgress - 进度回调函数
 * @returns {Promise<Object>} - 上传结果
 */
const uploadFile = async (file, options = {}) => {
  const { type = 'image', onProgress } = options;
  
  // 检查文件类型
  const allowedTypes = type === 'image' ? uploadConfig.imageTypes : uploadConfig.videoTypes;
  if (!checkFileType(file, allowedTypes)) {
    throw new Error(`不支持的文件类型，请上传${type === 'image' ? '图片' : '视频'}文件`);
  }
  
  // 检查文件大小
  if (!checkFileSize(file)) {
    throw new Error(`文件大小不能超过${uploadConfig.maxFileSize / (1024 * 1024)}MB`);
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '文件上传失败');
  }
};

/**
 * 上传多张图片
 * @param {Array<File>} files - 要上传的图片文件数组
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Array<Object>>} - 上传结果数组
 */
const uploadImages = async (files, onProgress) => {
  const uploadPromises = files.map((file, index) => {
    return uploadFile(file, {
      type: 'image',
      onProgress: (progress) => {
        if (onProgress) {
          const overallProgress = Math.round(((index * 100) + progress) / files.length);
          onProgress(overallProgress);
        }
      },
    });
  });
  
  return Promise.all(uploadPromises);
};

/**
 * 上传单个视频
 * @param {File} file - 要上传的视频文件
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Object>} - 上传结果
 */
const uploadVideo = async (file, onProgress) => {
  return uploadFile(file, {
    type: 'video',
    onProgress,
  });
};

/**
 * 提交文字内容
 * @param {string} content - 要提交的文字内容
 * @returns {Promise<Object>} - 提交结果
 */
const submitText = async (content) => {
  if (!content || content.trim() === '') {
    throw new Error('文字内容不能为空');
  }
  
  try {
    const response = await axios.post('/api/text/submit', {
      content: content.trim(),
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '文字提交失败');
  }
};

/**
 * 生成文件预览URL
 * @param {File} file - 要生成预览的文件
 * @returns {string} - 预览URL
 */
const generatePreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * 释放预览URL
 * @param {string} url - 要释放的预览URL
 */
const revokePreviewUrl = (url) => {
  URL.revokeObjectURL(url);
};

export const uploadUtils = {
  uploadConfig,
  uploadFile,
  uploadImages,
  uploadVideo,
  submitText,
  generatePreviewUrl,
  revokePreviewUrl,
  checkFileType,
  checkFileSize,
};

export default uploadUtils;