import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Typography, Row, Col, Space, Divider, Spin, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useDemandStore } from '../../store/demandStore';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DemandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 判断是创建还是编辑模式
  const isEditMode = !!id;
  
  // 从store获取状态和方法
  const {
    serviceTypes,
    currentDemand,
    loading,
    getDemandById,
    createDemand,
    updateDemand
  } = useDemandStore();

  // 加载需求数据（编辑模式）
  useEffect(() => {
    if (isEditMode && id) {
      getDemandById(id);
    }
  }, [isEditMode, id, getDemandById]);

  // 当currentDemand变化时，填充表单数据（编辑模式）
  useEffect(() => {
    if (isEditMode && currentDemand) {
      form.setFieldsValue({
        type: currentDemand.type,
        title: currentDemand.title,
        description: currentDemand.description,
        address: currentDemand.address,
        status: currentDemand.status
      });
    }
  }, [isEditMode, currentDemand, form]);

  // 返回需求列表
  const handleBack = () => {
    if (isEditMode) {
      navigate(`/demand/${id}`);
    } else {
      navigate('/demand');
    }
  };

  // 提交表单
  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (isEditMode && id) {
        // 编辑需求
        updateDemand(id, values);
        message.success('需求更新成功');
        navigate(`/demand/${id}`);
      } else {
        // 创建新需求
        createDemand(values);
        message.success('需求创建成功');
        navigate('/demand');
      }
    }).catch(errorInfo => {
      console.log('表单验证失败:', errorInfo);
      message.error('表单验证失败，请检查填写内容');
    });
  };

  // 表单验证规则
  const formRules = {
    type: [
      { required: true, message: '请选择服务类型', trigger: 'change' }
    ],
    title: [
      { required: true, message: '请输入需求标题', trigger: 'blur' },
      { max: 50, message: '需求标题不能超过50个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入需求描述', trigger: 'blur' },
      { max: 500, message: '需求描述不能超过500个字符', trigger: 'blur' }
    ],
    address: [
      { required: true, message: '请输入地址', trigger: 'blur' },
      { max: 100, message: '地址不能超过100个字符', trigger: 'blur' }
    ]
  };

  // 如果是编辑模式且正在加载，显示加载状态
  if (isEditMode && loading && !currentDemand) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: '#f0f2f5',
        padding: '20px'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f0f2f5' }}>
      {/* 返回按钮和标题 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            返回
          </Button>
        </Col>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {isEditMode ? '编辑需求' : '创建需求'}
          </Title>
        </Col>
        <Col style={{ width: 100 }}></Col> {/* 占位，保持标题居中 */}
      </Row>

      {/* 表单卡片 */}
      <Card bordered={true}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: '',
            title: '',
            description: '',
            address: '',
            status: '待处理'
          }}
        >
          <Row gutter={[16, 16]}>
            {/* 服务类型 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
              <Form.Item
                name="type"
                label="服务类型"
                rules={formRules.type}
              >
                <Select placeholder="请选择服务类型">
                  {serviceTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 需求标题 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={16}>
              <Form.Item
                name="title"
                label="需求标题"
                rules={formRules.title}
              >
                <Input placeholder="请输入需求标题" maxLength={50} />
              </Form.Item>
            </Col>

            {/* 需求描述 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="description"
                label="需求描述"
                rules={formRules.description}
              >
                <TextArea 
                  placeholder="请输入需求描述" 
                  rows={4} 
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            {/* 地址 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="address"
                label="地址"
                rules={formRules.address}
              >
                <Input placeholder="请输入地址" maxLength={100} />
              </Form.Item>
            </Col>

            {/* 状态（仅编辑模式显示） */}
            {isEditMode && (
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态', trigger: 'change' }]}
                >
                  <Select placeholder="请选择状态">
                    <Option value="待处理">待处理</Option>
                    <Option value="处理中">处理中</Option>
                    <Option value="已完成">已完成</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Divider />

          {/* 提交按钮 */}
          <Row justify="center">
            <Space size="large">
              <Button 
                type="default" 
                size="large"
                onClick={handleBack}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSubmit}
              >
                {isEditMode ? '保存修改' : '创建需求'}
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {/* 表单说明 */}
      <Row justify="center" style={{ marginTop: 24 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            {isEditMode 
              ? '修改需求信息后点击保存按钮，将更新到系统中' 
              : '填写需求信息后点击创建按钮，将添加新的需求到系统中'}
          </Typography.Text>
        </Col>
      </Row>
    </div>
  );
};

export default DemandForm;
