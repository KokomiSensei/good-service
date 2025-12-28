import request from '../../utils/axios';

/**
 * 响应文件上传相关API接口
 * 严格基于OpenAPI规范定义
 * 
 * OpenAPI路径:
 * - POST /api/responses/{responseId}/file - 上传响应文件
 * - PUT /api/responses/{responseId}/file - 替换响应文件  
 * - GET /api/responses/{responseId}/file/resource - 获取最新响应文件
 */

/**
 * 为指定响应上传文件
 * @param {number} responseId - 响应ID (路径参数)
 * @param {File} file - 要上传的文件 (multipart/form-data)
 * @param {Object} options - 上传选项
 * @param {Function} options.onProgress - 上传进度回调函数
 * @returns {Promise<{id: number, originalName: string, mimeType: string, sizeBytes: number, relPath: string, url: string}>} 文件信息对象
 */
export const uploadResponseFile = (responseId, file, options = {}) => {
  const { onProgress } = options;
  console.log('[DEBUG] uploadResponseFile called:', { responseId, fileName: file.name, fileSize: file.size, fileType: file.type });
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('[DEBUG] Starting upload request to:', `/api/responses/${responseId}/file`);
  
  return request({
    url: `/responses/${responseId}/file`,
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
 * 替换响应的文件
 * @param {number} responseId - 响应ID (路径参数)
 * @param {File} file - 要上传的新文件 (multipart/form-data)
 * @param {Object} options - 上传选项
 * @param {Function} options.onProgress - 上传进度回调函数
 * @returns {Promise<{id: number, originalName: string, mimeType: string, sizeBytes: number, relPath: string, url: string}>} 文件信息对象
 */
export const replaceResponseFile = (responseId, file, options = {}) => {
  const { onProgress } = options;
  console.log('[DEBUG] replaceResponseFile called:', { responseId, fileName: file.name, fileSize: file.size, fileType: file.type });
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('[DEBUG] Starting replace request to:', `/api/responses/${responseId}/file`);
  
  return request({
    url: `/responses/${responseId}/file`,
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
 * 获取响应的最新文件
 * @param {number} responseId - 响应ID (路径参数)
 * @param {boolean} download - 是否下载文件 (查询参数，默认false)
 * @returns {Promise<Blob|Object>} 文件资源对象或文件流
 */
export const getLatestResponseFile = (responseId, download = false) => {
  console.log('[DEBUG] getLatestResponseFile called:', { responseId, download });
  
  // 对于这个特定的API，无论download参数如何，都可能返回文件流
  // 所以我们需要处理两种情况：
  // 1. 如果是下载模式，返回blob用于下载
  // 2. 如果是检查模式，仍然接收blob但从中提取文件信息
  
  return request({
    url: `/responses/${responseId}/file/resource`,
    method: 'get',
    params: { download },
    responseType: 'blob', // 始终使用blob类型，因为这个API返回文件流
  }).then(response => {
    // 如果不是下载模式，尝试从响应中提取文件信息
    if (!download && response.data) {
      const blob = response.data;
      
      // 尝试从blob中提取基本的文件信息
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `response_${responseId}_file`;
      
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
          url: `/api/responses/${responseId}/file/resource?download=true`
        }
      };
    }
    
    return response;
  }).catch(error => {
    console.error('[DEBUG] getLatestResponseFile failed:', error);
    
    // 如果是404或其他错误，返回表示没有文件
    if (error.response?.status === 404) {
      return { data: null };
    }
    
    throw error;
  });
};

/**
 * 删除响应文件（如果支持的话）
 * 注意：OpenAPI文档中没有定义删除接口，这个函数可能需要根据实际后端实现来调整
 * @param {number} responseId - 响应ID (路径参数)
 * @returns {Promise<void>} 删除结果
 */
export const deleteResponseFile = (responseId) => {
  console.log('[DEBUG] deleteResponseFile called:', { responseId });
  
  // 注意：这个接口在OpenAPI文档中没有定义，需要确认后端是否支持
  // 如果后端支持DELETE方法，可以取消注释下面的代码
  /*
  return request({
    url: `/responses/${responseId}/file`,
    method: 'delete',
  });
  */
  
  // 目前返回一个Promise.reject来表示接口不可用
  return Promise.reject(new Error('删除响应文件接口尚未在OpenAPI文档中定义'));
};