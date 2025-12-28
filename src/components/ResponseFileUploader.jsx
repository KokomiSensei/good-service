import React, { useState, useEffect } from 'react';
import { message, Card, Space, Button, Modal } from 'antd';
import { UploadOutlined, FileOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import FileUploader from './FileUploader';
import {
  uploadResponseFile,
  replaceResponseFile,
  getLatestResponseFile
} from '../api/modules/responseFile';

/**
 * 响应文件上传组件
 * 基于OpenAPI规范，只使用三个核心接口
 * 完全复制DemandFileUploader的逻辑和结构
 */
const ResponseFileUploader = ({
  responseId,
  title = "响应文件管理",
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv",
  maxSize = 50 * 1024 * 1024, // 50MB
  onFileChange,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // 检查文件状态
  const checkFileStatus = async () => {
    if (!responseId) return;
    
    try {
      const response = await getLatestResponseFile(responseId, false);
      setHasFile(!!response.data);
    } catch (error) {
      setHasFile(false);
    }
  };

  // 组件挂载时检查文件状态
  useEffect(() => {
    if (responseId) {
      checkFileStatus();
    }
  }, [responseId]);

  // 文件上传处理
  const handleUpload = async (file, options = {}) => {
    console.log('[DEBUG] ResponseFileUploader handleUpload called:', { responseId, fileName: file.name, options });
    
    if (!responseId) {
      console.error('[DEBUG] ResponseFileUploader: responseId is missing');
      message.error('响应ID不能为空');
      throw new Error('响应ID不能为空');
    }

    try {
      console.log('[DEBUG] ResponseFileUploader: calling uploadResponseFile');
      const response = await uploadResponseFile(responseId, file, options);
      console.log('[DEBUG] ResponseFileUploader: uploadResponseFile response:', response);
      
      message.success('文件上传成功');
      
      // 重新检查文件状态
      console.log('[DEBUG] ResponseFileUploader: checking file status after upload');
      await checkFileStatus();
      
      // 通知父组件
      if (onFileChange) {
        console.log('[DEBUG] ResponseFileUploader: calling onFileChange callback');
        onFileChange('upload', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('[DEBUG] ResponseFileUploader: upload failed:', error);
      message.error('文件上传失败: ' + (error.message || '未知错误'));
      throw error;
    }
  };

  // 文件替换处理
  const handleReplace = async (file, options = {}) => {
    console.log('[DEBUG] ResponseFileUploader handleReplace called:', { responseId, fileName: file.name, options });
    
    if (!responseId) {
      console.error('[DEBUG] ResponseFileUploader: responseId is missing for replace');
      message.error('响应ID不能为空');
      throw new Error('响应ID不能为空');
    }

    try {
      console.log('[DEBUG] ResponseFileUploader: calling replaceResponseFile');
      const response = await replaceResponseFile(responseId, file, options);
      console.log('[DEBUG] ResponseFileUploader: replaceResponseFile response:', response);
      
      message.success('文件替换成功');
      
      // 重新检查文件状态
      console.log('[DEBUG] ResponseFileUploader: checking file status after replace');
      await checkFileStatus();
      
      // 通知父组件
      if (onFileChange) {
        console.log('[DEBUG] ResponseFileUploader: calling onFileChange callback for replace');
        onFileChange('replace', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('[DEBUG] ResponseFileUploader: replace failed:', error);
      message.error('文件替换失败: ' + (error.message || '未知错误'));
      throw error;
    }
  };

  // 文件下载处理
  const handleDownload = async () => {
    if (!responseId) {
      message.error('响应ID不能为空');
      throw new Error('响应ID不能为空');
    }

    try {
      const response = await getLatestResponseFile(responseId, true);
      
      // 创建临时链接进行下载
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `response_${responseId}_file`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载文件');
    } catch (error) {
      console.error('文件下载失败:', error);
      message.error('文件下载失败: ' + (error.message || '未知错误'));
      throw error;
    }
  };

  // 文件预览处理
  const handlePreview = async () => {
    if (!responseId) {
      message.error('响应ID不能为空');
      return;
    }

    try {
      const response = await getLatestResponseFile(responseId, false);
      setPreviewFile(response.data);
      setPreviewVisible(true);
    } catch (error) {
      console.error('文件预览失败:', error);
      message.error('文件预览失败: ' + (error.message || '未知错误'));
    }
  };

  return (
    <div className="response-file-uploader">
      <Card
        title={title}
        extra={
          <Space>
            {hasFile && (
              <>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  loading={loading}
                >
                  预览
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  loading={loading}
                >
                  下载
                </Button>
                <FileUploader
                  onUpload={handleReplace}
                  accept={accept}
                  maxSize={maxSize}
                  showFileList={false}
                  disabled={loading}
                >
                  <Button icon={<UploadOutlined />} loading={loading}>
                    替换文件
                  </Button>
                </FileUploader>
              </>
            )}
          </Space>
        }
        loading={loading}
        {...props}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 文件上传区域 */}
          <FileUploader
            onUpload={handleUpload}
            accept={accept}
            maxSize={maxSize}
            multiple={false}
            showFileList={false}
            disabled={loading}
          />

          {/* 状态显示 */}
          {hasFile ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#52c41a' }}>
              <FileOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div>已有文件，可以预览、下载或替换</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>暂无文件，请上传</div>
            </div>
          )}
        </Space>
      </Card>

      {/* 文件预览模态框 */}
      <Modal
        title="文件预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewFile && (
          <div>
            <pre style={{ 
              maxHeight: '400px', 
              overflow: 'auto', 
              padding: '16px', 
              background: '#f5f5f5',
              borderRadius: '4px'
            }}>
              {JSON.stringify(previewFile, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResponseFileUploader;