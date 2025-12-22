import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Spin,
  message,
  Table,
  Modal,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ConfigProvider from "antd/es/config-provider";
import { useDemandStore } from "../../store/demandStore";
import { useUserStore } from "../../store/userStore";
import antdTheme from "../../config/theme";
const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const IServe = () => {
  const navigate = useNavigate();

  // 从userStore获取用户状态
  const { isLoggedIn, userInfo } = useUserStore();

  // 从store获取状态和方法
  const {
    myServiceResponses,
    serviceTypes,
    loading,
    getMyServiceResponses,
    deleteMyServiceResponse,
  } = useDemandStore();

  // 初始化加载自己的响应列表
  useEffect(() => {
    if (isLoggedIn && userInfo?.id) {
      getMyServiceResponses(userInfo.id);
    } else {
      // 如果用户未登录，跳转到登录页面
      message.warning("请先登录查看您的响应");
      navigate("/login");
    }
  }, [getMyServiceResponses, isLoggedIn, userInfo?.id, navigate]);

  // 处理查看需求详情
  const handleViewDetail = (demandId) => {
    navigate(`/demand/${demandId}`);
  };

  // 处理修改响应
  const handleEditResponse = (response) => {
    if (response.status === "已接受") {
      message.warning("已接受的响应无法修改");
      return;
    }
    navigate(`/i-serve/response/${response.demandId}`, {
      state: { isEdit: true, response },
    });
  };

  // 处理删除响应
  const handleDeleteResponse = (responseId, status) => {
    if (status === "已接受") {
      message.warning("已接受的响应无法删除");
      return;
    }
    Modal.confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: "确定要删除这个响应吗？",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        deleteMyServiceResponse(responseId);
        message.success("响应删除成功");
      },
    });
  };

  // 状态标签颜色映射
  const statusColorMap = {
    待审核: "blue",
    已接受: "green",
    已拒绝: "red",
  };

  // 表格列定义
  const columns = [
    {
      title: "需求标题",
      dataIndex: "demandTitle",
      key: "demandTitle",
      ellipsis: true,
      width: 200,
      render: (title, record) => (
        <Space>
          <span>{title}</span>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.demandId)}
          />
        </Space>
      ),
    },
    {
      title: "服务类型",
      dataIndex: "serviceType",
      key: "serviceType",
      ellipsis: true,
      width: 120,
      render: (type) => <Tag color="default">{type}</Tag>,
    },
    {
      title: "需求状态",
      dataIndex: "demandStatus",
      key: "demandStatus",
      ellipsis: true,
      width: 100,
      render: (status) => (
        <Tag color={statusColorMap[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "我的响应状态",
      dataIndex: "status",
      key: "status",
      ellipsis: true,
      width: 120,
      render: (status) => (
        <Tag color={statusColorMap[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "响应内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      width: 300,
    },
    {
      title: "响应时间",
      dataIndex: "responseTime",
      key: "responseTime",
      ellipsis: true,
      width: 180,
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      ellipsis: true,
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {record.status !== "已接受" && (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditResponse(record)}
              >
                修改
              </Button>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDeleteResponse(record.id, record.status)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 统计信息
  const statistics = {
    total: myServiceResponses?.length || 0,
    pending: (
      myServiceResponses?.filter((resp) => resp.status === "待审核") || []
    ).length,
    accepted: (
      myServiceResponses?.filter((resp) => resp.status === "已接受") || []
    ).length,
    rejected: (
      myServiceResponses?.filter((resp) => resp.status === "已拒绝") || []
    ).length,
  };

  return (
    <div style={{ padding: "20px", background: "#f0f2f5" }}>
      <Title level={1} style={{ marginBottom: 24, textAlign: "center" }}>
        我服务 - 我的响应列表
      </Title>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                {statistics.total}
              </Title>
              <div>总响应数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                {statistics.pending}
              </Title>
              <div>待审核响应</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {statistics.accepted}
              </Title>
              <div>已接受响应</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                {statistics.rejected}
              </Title>
              <div>已拒绝响应</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 响应列表 - 表格形式 */}
      <Card>
        <Spin spinning={loading} tip="加载中...">
          {myServiceResponses.length > 0 ? (
            <Table
              columns={columns}
              dataSource={myServiceResponses}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
              }}
              scroll={{ x: 1200 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Typography.Text type="secondary">
                您还没有响应任何服务
              </Typography.Text>
              <Button
                type="primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate("/demand")}
              >
                去需求中心响应
              </Button>
            </div>
          )}
        </Spin>
      </Card>

      {/* 说明 */}
      <Divider />
      <div style={{ textAlign: "center", color: "#999" }}>
        <Typography.Text>您可以查看、修改和删除您的响应</Typography.Text>
        <br />
        <Typography.Text type="secondary">
          注意：只有状态为"待审核"的响应可以修改和删除
        </Typography.Text>
      </div>
    </div>
  );
};

export default IServe;
