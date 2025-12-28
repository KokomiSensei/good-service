import React, { useState, useRef } from 'react';
import { Upload, Button, message, Progress, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';

/**
 * 通用文件上传组件
 * 提供文件上传、进度显示、错误处理等功能
 */
const FileUploader = ({
  onUpload,
  onDelete,
  onDownload,
  accept = "*",
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  disabled = false,
  showFileList = true,
  children,
  ...props
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const fileInputRef = useRef(null);

  // 文件大小格式化
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 文件类型验证
  const validateFile = (file) => {
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
  };

  // 处理文件选择
  const handleFileSelect = async (file) => {
    console.log('[DEBUG] FileUploader handleFileSelect called:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    if (!validateFile(file)) {
      console.log('[DEBUG] File validation failed for:', file.name);
      return false;
    }

    console.log('[DEBUG] File validation passed, starting upload for:', file.name);
    setUploading(true);
    setProgress(0);

    try {
      // 调用上传函数，传递进度回调
      console.log('[DEBUG] Calling onUpload with file:', file.name);
      const result = await onUpload(file, {
        onProgress: (progress) => {
          console.log('[DEBUG] FileUploader progress update:', progress + '%');
          setProgress(progress);
        }
      });
      
      console.log('[DEBUG] Upload completed successfully for:', file.name, 'Result:', result);
      setProgress(100);
      
      // 添加到文件列表
      const newFile = {
        uid: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'done',
        response: result,
        percent: 100
      };
      
      setFileList(prev => multiple ? [...prev, newFile] : [newFile]);
      message.success(`${file.name} 上传成功`);
      
      return newFile;
    } catch (error) {
      console.error('[DEBUG] Upload failed for:', file.name, 'Error:', error);
      message.error(`${file.name} 上传失败: ${error.message}`);
      return false;
    } finally {
      console.log('[DEBUG] FileUploader upload finished for:', file.name);
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // 处理文件删除
  const handleDelete = async (file) => {
    try {
      if (onDelete) {
        await onDelete(file);
      }
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
      message.success(`${file.name} 删除成功`);
    } catch (error) {
      message.error(`${file.name} 删除失败: ${error.message}`);
    }
  };

  // 处理文件下载
  const handleDownload = async (file) => {
    try {
      if (onDownload) {
        await onDownload(file);
      }
    } catch (error) {
      message.error(`${file.name} 下载失败: ${error.message}`);
    }
  };

  // 自定义上传行为
  const customRequest = ({ file, onSuccess, onError, onProgress }) => {
    console.log('[DEBUG] FileUploader customRequest called:', { fileName: file.name });
    handleFileSelect(file).then(result => {
      if (result) {
        onSuccess(result);
      } else {
        onError(new Error('上传失败'));
      }
    }).catch(onError);
  };

  // 处理文件变化（用于手动上传模式）
  const handleFileChange = (info) => {
    console.log('[DEBUG] FileUploader handleFileChange called:', { file: info.file, fileList: info.fileList });
    if (info.file && info.file.status === 'removed') {
      // 文件被移除，不需要处理
      return;
    }
    
    // 当文件被选择时，立即调用 onUpload 回调
    if (info.file && !info.file.status) {
      console.log('[DEBUG] FileUploader: new file selected, calling handleFileSelect');
      handleFileSelect(info.file);
    }
  };

  return (
    <div className="file-uploader">
      <Upload
        customRequest={customRequest}
        fileList={showFileList ? fileList : undefined}
        onRemove={handleDelete}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        accept={accept}
        multiple={multiple}
        beforeUpload={() => false} // 阻止默认上传行为
        {...props}
      >
        {children || (
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={disabled}
          >
            {uploading ? '上传中...' : '选择文件'}
          </Button>
        )}
      </Upload>
      
      {uploading && progress > 0 && (
        <div style={{ marginTop: 8 }}>
          <Progress percent={progress} size="small" />
        </div>
      )}
      
      {showFileList && fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {fileList.map(file => (
              <div key={file.uid} style={{ 
                padding: '8px 12px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <Space>
                  {onDownload && (
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(file)}
                      size="small"
                    >
                      下载
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(file)}
                      size="small"
                    >
                      删除
                    </Button>
                  )}
                </Space>
              </div>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

export default FileUploader;