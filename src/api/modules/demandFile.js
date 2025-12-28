import request from '../../utils/axios';

/**
 * 需求文件上传相关API接口
 * 严格基于OpenAPI规范定义
 * 
 * OpenAPI路径:
 * - POST /demands/{demandId}/file - 上传附件
 * - PUT /demands/{demandId}/file - 替换附件  
 * - GET /demands/{demandId}/file/resource - 获取最新附件
 */

/**
 * 为指定需求上传附件
 * @param {number} demandId - 需求ID (路径参数)
 * @param {File} file - 要上传的文件 (multipart/form-data)
 * @param {Object} options - 上传选项
 * @param {Function} options.onProgress - 上传进度回调函数
 * @returns {Promise<{id: number, originalName: string, mimeType: string, sizeBytes: number, relPath: string, url: string}>} 文件信息对象
 */
export const uploadDemandFile = (demandId, file, options = {}) => {
  const { onProgress } = options;
  console.log('[DEBUG] uploadDemandFile called:', { demandId, fileName: file.name, fileSize: file.size, fileType: file.type });
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('[DEBUG] Starting upload request to:', `/demands/${demandId}/file`);
  
  return request({
    url: `/demands/${demandId}/file`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('[DEBUG] Upload progress:', progress + '%', { loaded: progressEvent.loaded, total: progressEvent.total });
        onProgress(progress);
      }
    },
  });
};

/**
 * 替换需求的附件文件
 * @param {number} demandId - 需求ID (路径参数)
 * @param {File} file - 要上传的新文件 (multipart/form-data)
 * @param {Object} options - 上传选项
 * @param {Function} options.onProgress - 上传进度回调函数
 * @returns {Promise<{id: number, originalName: string, mimeType: string, sizeBytes: number, relPath: string, url: string}>} 文件信息对象
 */
export const replaceDemandFile = (demandId, file, options = {}) => {
  const { onProgress } = options;
  console.log('[DEBUG] replaceDemandFile called:', { demandId, fileName: file.name, fileSize: file.size, fileType: file.type });
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('[DEBUG] Starting replace request to:', `/demands/${demandId}/file`);
  
  return request({
    url: `/demands/${demandId}/file`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('[DEBUG] Replace progress:', progress + '%', { loaded: progressEvent.loaded, total: progressEvent.total });
        onProgress(progress);
      }
    },
  });
};

/**
 * 获取需求的最新附件文件
 * @param {number} demandId - 需求ID (路径参数)
 * @param {boolean} download - 是否下载文件 (查询参数)
 * @returns {Promise<Blob|Object>} 文件资源对象或文件流
 */
export const getLatestDemandFile = (demandId, download = false) => {
  console.log('[DEBUG] getLatestDemandFile called:', { demandId, download });
  
  // 对于这个特定的API，无论download参数如何，都可能返回文件流
  // 所以我们需要处理两种情况：
  // 1. 如果是下载模式，返回blob用于下载
  // 2. 如果是检查模式，仍然接收blob但从中提取文件信息
  
  return request({
    url: `/demands/${demandId}/file/resource`,
    method: 'get',
    params: { download },
    responseType: 'blob', // 始终使用blob类型，因为这个API返回文件流
  }).then(response => {
    // 如果不是下载模式，尝试从响应中提取文件信息
    if (!download && response.data) {
      const blob = response.data;
      
      // 尝试从blob中提取基本的文件信息
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `demand_${demandId}_file`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // 返回包含文件信息的对象
      return {
        data: {
          filename: filename,
          size: blob.size,
          type: blob.type,
          lastModified: blob.lastModified,
          exists: true,
          url: `/demands/${demandId}/file/resource?download=true`
        }
      };
    }
    
    return response;
  }).catch(error => {
    console.error('[DEBUG] getLatestDemandFile failed:', error);
    
    // 如果是404或其他错误，返回表示没有文件
    if (error.response?.status === 404) {
      return { data: null };
    }
    
    throw error;
  });
};