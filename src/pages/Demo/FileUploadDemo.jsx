import React, { useState } from 'react';
import { Card, Space, Button, Input, Form, message, Divider, Tabs } from 'antd';
import { UploadOutlined, FileOutlined, ReloadOutlined, ApiOutlined, CodeOutlined } from '@ant-design/icons';
import DemandFileUploader from '../../components/DemandFileUploader';
import FileUploader from '../../components/FileUploader';
import useFileUpload from '../../hooks/useFileUpload';

/**
 * 文件上传功能演示页面
 * 展示如何使用封装的文件上传组件和Hook
 */
const FileUploadDemo = () => {
  const [demandId, setDemandId] = useState('123');
  const [form] = Form.useForm();
  
  // 使用自定义Hook
  const {
    uploading,
    downloading,
    loading,
    hasFile,
    uploadFile,
    replaceFile,
    downloadFile,
    previewFile,
    refreshFileStatus,
    formatFileSize,
    validateFile
  } = useFileUpload(demandId);

  // 处理需求ID变化
  const handleDemandIdChange = (value) => {
    setDemandId(value);
  };

  // 自定义上传处理
  const handleCustomUpload = async (file) => {
    try {
      const result = await uploadFile(file, {
        accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif',
        maxSize: 20 * 1024 * 1024 // 20MB
      });
      console.log('上传成功:', result);
      return result;
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
  };

  // 处理文件变化
  const handleFileChange = (action, file) => {
    console.log('文件操作:', action, file);
    message.info(`文件${action}操作完成`);
  };

  // 刷新文件状态
  const handleRefresh = () => {
    refreshFileStatus();
    message.success('文件状态已刷新');
  };

  const tabItems = [
    {
      key: 'components',
      label: (
        <span>
          <UploadOutlined />
          组件演示
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 基础文件上传组件演示 */}
          <Card title="基础文件上传组件">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <h3>单文件上传</h3>
                <FileUploader
                  onUpload={handleCustomUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                  maxSize={20 * 1024 * 1024}
                  multiple={false}
                  showFileList={true}
                />
              </div>
              
              <Divider />
              
              <div>
                <h3>多文件上传</h3>
                <FileUploader
                  onUpload={handleCustomUpload}
                  accept="*"
                  maxSize={50 * 1024 * 1024}
                  multiple={true}
                  showFileList={true}
                >
                  <Button icon={<UploadOutlined />} type="dashed">
                    点击上传多个文件
                  </Button>
                </FileUploader>
              </div>
            </Space>
          </Card>

           {/* 需求文件上传组件演示 */}
           <Card title="需求文件上传组件">
             <DemandFileUploader
               demandId={demandId}
               title={`需求 ${demandId} 文件管理`}
               accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg"
               maxSize={50 * 1024 * 1024}
               onFileChange={handleFileChange}
             />
           </Card>
        </Space>
      )
    },
    {
      key: 'hook',
      label: (
        <span>
          <ApiOutlined />
          Hook使用
        </span>
      ),
      children: (
        <Card title="自定义Hook使用演示">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
             <div>
               <h3>当前状态</h3>
               <Space>
                 <span>需求ID: {demandId || '未设置'}</span>
                 <span>是否有文件: {hasFile ? '是' : '否'}</span>
                 <span>上传中: {uploading ? '是' : '否'}</span>
                 <span>下载中: {downloading ? '是' : '否'}</span>
               </Space>
             </div>
             
             <div>
               <h3>文件状态</h3>
               {hasFile ? (
                 <div style={{ 
                   padding: '20px', 
                   border: '1px solid #d9d9d9', 
                   borderRadius: '4px',
                   textAlign: 'center',
                   background: '#f6ffed'
                 }}>
                   <FileOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                   <div>已有文件，可以进行预览、下载或替换操作</div>
                 </div>
               ) : (
                 <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                   <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                   <div>暂无文件，请上传</div>
                 </div>
               )}
             </div>
             
             <div>
               <h3>操作按钮</h3>
               <Space>
                 <Button 
                   type="primary" 
                   onClick={() => refreshFileStatus()}
                   loading={loading}
                 >
                   刷新状态
                 </Button>
                 <Button 
                   onClick={() => previewFile()}
                   disabled={!hasFile}
                 >
                   预览文件
                 </Button>
                 <Button 
                   onClick={() => downloadFile()}
                   disabled={!hasFile}
                   loading={downloading}
                 >
                   下载文件
                 </Button>
               </Space>
             </div>
          </Space>
        </Card>
      )
    },
    {
      key: 'guide',
      label: (
        <span>
          <CodeOutlined />
          使用说明
        </span>
      ),
      children: (
        <Card title="使用说明">
          <div style={{ lineHeight: '1.8' }}>
            <h3>组件说明</h3>
            <ul>
              <li><strong>FileUploader</strong>: 通用文件上传组件，支持单文件/多文件上传、进度显示、文件验证等功能</li>
              <li><strong>DemandFileUploader</strong>: 专门用于需求文件管理的组件，集成了demandFile接口的所有功能</li>
              <li><strong>useFileUpload</strong>: 自定义Hook，提供文件上传相关的状态管理和操作方法</li>
            </ul>
            
             <h3>功能特性</h3>
             <ul>
               <li>✅ 文件上传、替换、下载、预览</li>
               <li>✅ 文件类型验证和大小限制</li>
               <li>✅ 上传进度显示</li>
               <li>✅ 错误处理和用户提示</li>
               <li>✅ 基于OpenAPI规范的简化接口</li>
               <li>✅ 响应式设计</li>
             </ul>
            
             <h3>使用方法</h3>
             <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`// 基础用法
<DemandFileUploader demandId="123" />

// 包含图片的文档上传
<DemandFileUploader 
  demandId="123"
  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
  maxSize={20 * 1024 * 1024}
  onFileChange={(action, file) => console.log(action, file)}
/>

// 仅图片上传
<DemandFileUploader 
  demandId="123"
  accept=".jpg,.jpeg,.png,.gif,.bmp,.svg"
  maxSize={10 * 1024 * 1024}
/>

// 使用Hook
const { 
  uploading, 
  downloading, 
  hasFile, 
  uploadFile, 
  replaceFile, 
  downloadFile, 
  previewFile, 
  refreshFileStatus 
} = useFileUpload(demandId);

// 上传文件
await uploadFile(file, { 
  accept: '.jpg,.png,.gif', 
  maxSize: 5 * 1024 * 1024 
});

// 替换文件
await replaceFile(file);

// 下载文件
await downloadFile();

// 预览文件
await previewFile();

// 刷新文件状态
await refreshFileStatus();`}
             </pre>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* 页面标题 */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h1>文件上传功能演示</h1>
            <p>展示基于demandFile接口封装的文件上传功能</p>
          </div>
        </Card>

        {/* 配置区域 */}
        <Card title="配置参数">
          <Form
            form={form}
            layout="inline"
            initialValues={{ demandId: '123' }}
          >
            <Form.Item label="需求ID" name="demandId">
              <Input 
                placeholder="请输入需求ID"
                onChange={(e) => handleDemandIdChange(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Item>
             <Form.Item>
               <Button 
                 type="primary" 
                 icon={<ReloadOutlined />}
                 onClick={handleRefresh}
                 loading={loading}
               >
                 刷新文件状态
               </Button>
             </Form.Item>
          </Form>
        </Card>

        {/* 主要内容区域 */}
        <Tabs 
          defaultActiveKey="components"
          items={tabItems}
          size="large"
        />
      </Space>
    </div>
  );
};

export default FileUploadDemo;