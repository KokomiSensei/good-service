/**
 * 文件处理工具函数
 * 提供文件验证、格式化、处理等通用功能
 */

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 验证文件类型和大小
 * @param {File} file - 要验证的文件
 * @param {string} accept - 接受的文件类型
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 验证结果
 */
export const validateFile = (file, accept = "*", maxSize = 10 * 1024 * 1024) => {
  // 检查文件大小
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小不能超过 ${formatFileSize(maxSize)}`
    };
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
    return {
      valid: false,
      error: `不支持的文件类型: ${file.name}`
    };
  }

  return {
    valid: true,
    error: null
  };
};

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 文件扩展名
 */
export const getFileExtension = (fileName) => {
  return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
};

/**
 * 检查文件是否为图片
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为图片
 */
export const isImageFile = (file) => {
  return file.type.startsWith('image/');
};

/**
 * 检查文件是否为PDF
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为PDF
 */
export const isPdfFile = (file) => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * 检查文件是否为Office文档
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为Office文档
 */
export const isOfficeFile = (file) => {
  const officeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  
  return officeTypes.includes(file.type) || 
         officeExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
};

/**
 * 生成文件唯一标识
 * @param {File} file - 文件对象
 * @returns {string} 文件唯一标识
 */
export const generateFileId = (file) => {
  return `${file.name}_${file.size}_${file.lastModified}_${Date.now()}`;
};

/**
 * 创建文件下载链接
 * @param {Blob|File} file - 文件对象或Blob
 * @param {string} fileName - 下载时的文件名
 */
export const downloadFile = (file, fileName) => {
  const url = window.URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 预览文件
 * @param {File} file - 要预览的文件
 * @returns {Promise<string>} 文件预览URL
 */
export const previewFile = (file) => {
  return new Promise((resolve, reject) => {
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else if (isPdfFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      reject(new Error('不支持预览的文件类型'));
    }
  });
};

/**
 * 获取常见文件类型的图标
 * @param {string} fileName - 文件名
 * @returns {string} 图标名称
 */
export const getFileIcon = (fileName) => {
  const extension = getFileExtension(fileName).toLowerCase();
  
  const iconMap = {
    // 图片文件
    'jpg': 'picture',
    'jpeg': 'picture',
    'png': 'picture',
    'gif': 'picture',
    'bmp': 'picture',
    'svg': 'picture',
    
    // 文档文件
    'pdf': 'file-pdf',
    'doc': 'file-word',
    'docx': 'file-word',
    'xls': 'file-excel',
    'xlsx': 'file-excel',
    'ppt': 'file-ppt',
    'pptx': 'file-ppt',
    'txt': 'file-text',
    
    // 压缩文件
    'zip': 'file-zip',
    'rar': 'file-zip',
    '7z': 'file-zip',
    
    // 视频文件
    'mp4': 'file-video',
    'avi': 'file-video',
    'mov': 'file-video',
    'wmv': 'file-video',
    
    // 音频文件
    'mp3': 'file-audio',
    'wav': 'file-audio',
    'flac': 'file-audio'
  };
  
  return iconMap[extension] || 'file-unknown';
};

/**
 * 获取文件类型分类
 * @param {File} file - 文件对象
 * @returns {string} 文件类型分类
 */
export const getFileTypeCategory = (file) => {
  if (isImageFile(file)) return 'image';
  if (isPdfFile(file)) return 'pdf';
  if (isOfficeFile(file)) return 'office';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.name.toLowerCase().match(/\.(zip|rar|7z)$/)) return 'archive';
  if (file.name.toLowerCase().match(/\.txt$/)) return 'text';
  return 'other';
};

/**
 * 批量处理文件
 * @param {Array<File>} files - 文件数组
 * @param {Function} processor - 处理函数
 * @returns {Promise<Array>} 处理结果数组
 */
export const processFiles = async (files, processor) => {
  const results = [];
  const errors = [];
  
  for (const file of files) {
    try {
      const result = await processor(file);
      results.push({ file, result, success: true });
    } catch (error) {
      errors.push({ file, error, success: false });
    }
  }
  
  return {
    results,
    errors,
    successCount: results.length,
    errorCount: errors.length,
    totalCount: files.length
  };
};