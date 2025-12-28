import { useState, useCallback } from 'react';
import { message } from 'antd';
import {
  uploadDemandFile,
  replaceDemandFile,
  getLatestDemandFile
} from '../api/modules/demandFile';

/**
 * 文件上传自定义Hook
 * 基于OpenAPI规范的三个核心接口
 */
const useFileUpload = (demandId = null) => {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  // 格式化文件大小
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // 验证文件
  const validateFile = useCallback((file, accept = "*", maxSize = 10 * 1024 * 1024) => {
    // 检查文件大小
    if (file.size > maxSize) {
      message.error(`文件大小不能超过 ${formatFileSize(maxSize)}`);
      return false;
    }

    // 检查文件类型
    if (accept !== "*" && !accept.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmedType.toLowerCase());
      }
      if (trimmedType.includes('/')) {
        const [type, subtype] = trimmedType.split('/');
        return file.type.startsWith(`${type}/`) || (subtype === '*' && file.type.startsWith(`${type}/`));
      }
      return file.type === trimmedType;
    })) {
      message.error(`不支持的文件类型: ${file.name}`);
      return false;
    }

    return true;
  }, [formatFileSize]);

  // 检查文件状态
  const checkFileStatus = useCallback(async () => {
    if (!demandId) return;
    
    try {
      const response = await getLatestDemandFile(demandId, false);
      setHasFile(!!response.data);
    } catch (error) {
      setHasFile(false);
    }
  }, [demandId]);

  // 上传文件
  const uploadFile = useCallback(async (file, options = {}) => {
    if (!demandId) {
      message.error('需求ID不能为空');
      throw new Error('需求ID不能为空');
    }

    const { accept = "*", maxSize = 10 * 1024 * 1024, onProgress } = options;

    if (!validateFile(file, accept, maxSize)) {
      throw new Error('文件验证失败');
    }

    setUploading(true);
    try {
      const response = await uploadDemandFile(demandId, file);
      message.success('文件上传成功');
      
      // 更新文件状态
      await checkFileStatus();
      
      return response.data;
    } catch (error) {
      console.error('文件上传失败:', error);
      message.error('文件上传失败: ' + (error.message || '未知错误'));
      throw error;
    } finally {
      setUploading(false);
    }
  }, [demandId, validateFile, checkFileStatus]);

  // 替换文件
  const replaceFile = useCallback(async (file, options = {}) => {
    console.log('[DEBUG] useFileUpload replaceFile called:', { demandId, fileName: file.name, options });
    
    if (!demandId) {
      console.error('[DEBUG] useFileUpload: demandId is missing for replace');
      message.error('需求ID不能为空');
      throw new Error('需求ID不能为空');
    }

    const { accept = "*", maxSize = 10 * 1024 * 1024, onProgress } = options;

    if (!validateFile(file, accept, maxSize)) {
      console.error('[DEBUG] useFileUpload: file validation failed for replace:', file.name);
      throw new Error('文件验证失败');
    }

    console.log('[DEBUG] useFileUpload: starting replace for:', file.name);
    setUploading(true);
    try {
      const response = await replaceDemandFile(demandId, file, { onProgress });
      console.log('[DEBUG] useFileUpload: replace completed successfully:', response);
      message.success('文件替换成功');
      
      // 更新文件状态
      await checkFileStatus();
      
      return response.data;
    } catch (error) {
      console.error('[DEBUG] useFileUpload: replace failed:', error);
      message.error('文件替换失败: ' + (error.message || '未知错误'));
      throw error;
    } finally {
      console.log('[DEBUG] useFileUpload: replace finished, setting uploading to false');
      setUploading(false);
    }
  }, [demandId, validateFile, checkFileStatus]);

  // 下载文件
  const downloadFile = useCallback(async () => {
    if (!demandId) {
      message.error('需求ID不能为空');
      throw new Error('需求ID不能为空');
    }

    setDownloading(true);
    try {
      const response = await getLatestDemandFile(demandId, true);
      
      // 创建临时链接进行下载
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `demand_${demandId}_file`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载文件');
      return true;
    } catch (error) {
      console.error('文件下载失败:', error);
      message.error('文件下载失败: ' + (error.message || '未知错误'));
      throw error;
    } finally {
      setDownloading(false);
    }
  }, [demandId]);

  // 预览文件
  const previewFile = useCallback(async () => {
    if (!demandId) {
      message.error('需求ID不能为空');
      throw new Error('需求ID不能为空');
    }

    try {
      const response = await getLatestDemandFile(demandId, false);
      return response.data;
    } catch (error) {
      console.error('文件预览失败:', error);
      message.error('文件预览失败: ' + (error.message || '未知错误'));
      throw error;
    }
  }, [demandId]);

  // 刷新文件状态
  const refreshFileStatus = useCallback(() => {
    checkFileStatus();
  }, [checkFileStatus]);

  return {
    // 状态
    uploading,
    downloading,
    loading,
    hasFile,
    
    // 操作方法
    uploadFile,
    replaceFile,
    downloadFile,
    previewFile,
    refreshFileStatus,
    
    // 工具方法
    formatFileSize,
    validateFile,
    
    // 常量
    demandId
  };
};

export default useFileUpload;