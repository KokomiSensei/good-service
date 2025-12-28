import React, { useState } from 'react';
import { Card, Space, Button, Input, Form, message, Typography, Divider } from 'antd';
import { UploadOutlined, FileOutlined, EyeOutlined } from '@ant-design/icons';
import DemandFileUploader from '../../components/DemandFileUploader';
import ResponseForm from '../../components/ResponseForm';

const { Title, Text } = Typography;

/**
 * 响应需求文件上传功能演示页面
 * 展示如何在响应需求表单中集成文件上传功能
 */
const ResponseUploadDemo = () => {
  const [demandId, setDemandId] = useState('123');
  const [activeTab, setActiveTab] = useState('integrated');

  // 处理成功回调
  const handleSuccess = () => {
    message.success('响应提交成功！');
  };

  const tabItems = [
    {
      key: 'integrated',
      label: '集成演示',
      children: (
        <Card title="ResponseForm组件（已集成文件上传）">
          <ResponseForm 
            demandId={parseInt(demandId)}
            demandTitle="示例需求：需要管道维修服务"
            onSuccess={handleSuccess}
          />
        </Card>
      )
    },
    {
      key: 'standalone',
      label: '独立组件',
      children: (
        <Card title="独立文件上传组件演示">
          <DemandFileUploader
            demandId={demandId}
            title="响应附件"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
            maxSize={20 * 1024 * 1024}
            onFileChange={(action, file) => {
              message.success(`文件${action}操作完成`);
            }}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* 页面标题 */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>响应需求文件上传功能演示</Title>
            <Text type="secondary">
              展示如何在响应需求表单中集成文件上传功能
            </Text>
          </div>
        </Card>

        {/* 配置区域 */}
        <Card title="配置参数">
          <Form layout="inline">
            <Form.Item label="需求ID">
              <Input 
                value={demandId}
                onChange={(e) => setDemandId(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Item>
          </Form>
        </Card>

        {/* 演示内容 */}
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>演示选项</Title>
            <Space>
              <Button 
                type={activeTab === 'integrated' ? 'primary' : 'default'}
                onClick={() => setActiveTab('integrated')}
              >
                集成演示
              </Button>
              <Button 
                type={activeTab === 'standalone' ? 'primary' : 'default'}
                onClick={() => setActiveTab('standalone')}
              >
                独立组件
              </Button>
            </Space>
          </div>

          {activeTab === 'integrated' ? (
            <Card title="ResponseForm组件（已集成文件上传）">
              <ResponseForm 
                demandId={parseInt(demandId)}
                demandTitle="示例需求：需要管道维修服务"
                onSuccess={handleSuccess}
              />
              <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
                <p><strong>双API调用说明：</strong></p>
                <ul>
                  <li>第一步：提交响应数据（不包含文件信息）</li>
                  <li>第二步：单独调用文件上传接口</li>
                  <li>两个API调用相互独立，提高系统可靠性</li>
                </ul>
              </div>
            </Card>
          ) : (
            <Card title="独立文件上传组件演示">
              <DemandFileUploader
                demandId={demandId}
                title="响应附件"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
                maxSize={20 * 1024 * 1024}
                onFileChange={(action, file) => {
                  message.success(`文件${action}操作完成`);
                }}
              />
            </Card>
          )}
        </Card>

        {/* 使用说明 */}
        <Card title="功能说明">
          <div style={{ lineHeight: '1.8' }}>
            <Title level={4}>集成功能</Title>
            <ul>
              <li><strong>文件上传</strong>: 支持多种文件格式上传，包括文档、图片、压缩包等</li>
              <li><strong>文件替换</strong>: 可以替换已上传的文件</li>
              <li><strong>文件预览</strong>: 支持在线预览文件内容</li>
              <li><strong>文件下载</strong>: 可以下载已上传的文件</li>
              <li><strong>大小限制</strong>: 单个文件最大20MB</li>
              <li><strong>类型验证</strong>: 自动验证文件类型和大小</li>
            </ul>
            
            <Title level={4}>技术实现</Title>
            <ul>
              <li>基于现有的 <code>DemandFileUploader</code> 组件</li>
              <li>使用 <code>demandFile</code> API接口进行文件管理</li>
              <li>集成到 <code>ResponseForm</code> 组件中，与文本内容一起提交</li>
              <li>支持编辑模式下的文件替换功能</li>
            </ul>

            <Title level={4}>使用场景</Title>
            <ul>
              <li>服务商提交服务方案和报价单</li>
              <li>上传相关资质证书和案例图片</li>
              <li>提供详细的服务计划和时间安排</li>
              <li>补充说明材料和技术文档</li>
            </ul>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default ResponseUploadDemo;