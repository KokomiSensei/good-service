import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Table,
  Row,
  Col,
  Typography,
  Space,
  Spin,
} from "antd";
import {
  SearchOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useDemandStore } from "../../store/demandStore";
import ReactECharts from "echarts-for-react";
import moment from "moment";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("line"); // line or bar
  const [statisticsData, setStatisticsData] = useState([]);
  const [chartData, setChartData] = useState(null);

  // 从store获取状态和方法
  const { demands, serviceResponses } = useDemandStore();

  // 地域选项（模拟数据）
  const regions = [
    "全部地域",
    "幸福小区",
    "阳光家园",
    "和谐社区",
    "安康小区",
    "福寿园",
  ];

  // 表格列配置
  const columns = [
    {
      title: "起始年月",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("YYYY-MM"),
    },
    {
      title: "终止年月",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("YYYY-MM"),
    },
    {
      title: "地域",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "月累计发布服务需求数",
      dataIndex: "monthlyDemands",
      key: "monthlyDemands",
    },
    {
      title: "月累计响应成功服务数",
      dataIndex: "monthlyResponses",
      key: "monthlyResponses",
    },
  ];

  // 默认查询最近6个月的数据
  useEffect(() => {
    const endDate = moment();
    const startDate = moment().subtract(5, "months");

    form.setFieldsValue({
      dateRange: [startDate, endDate],
      region: "全部地域",
    });

    handleSearch({
      dateRange: [startDate, endDate],
      region: "全部地域",
    });
  }, [form]);

  // 处理查询
  const handleSearch = (values) => {
    setLoading(true);

    const { dateRange, region } = values;
    const startDate = dateRange[0];
    const endDate = dateRange[1];

    // 生成月份数组
    const months = [];
    let current = moment(startDate);
    while (
      current.isBefore(moment(endDate)) ||
      current.isSame(moment(endDate), "month")
    ) {
      months.push(moment(current));
      current.add(1, "month");
    }

    // 统计每月数据
    const monthlyStats = months.map((month) => {
      // 筛选该月的需求
      const monthDemands = demands.filter((demand) => {
        const demandDate = moment(demand.createTime);
        const matchesDate = demandDate.isSame(month, "month");
        const matchesRegion =
          region === "全部地域" || demand.address.includes(region);
        return matchesDate && matchesRegion;
      });

      // 筛选该月的成功响应
      const monthResponses = serviceResponses.filter((response) => {
        const responseDate = moment(response.responseTime);
        const matchesDate = responseDate.isSame(month, "month");
        const matchesRegion =
          region === "全部地域" ||
          (
            demands.find((d) => d.id === response.demandId)?.address || ""
          ).includes(region);
        const isSuccess = response.status === "已接受";
        return matchesDate && matchesRegion && isSuccess;
      });

      return {
        key: month.format("YYYY-MM"),
        startDate: month.startOf("month").toDate(),
        endDate: month.endOf("month").toDate(),
        region,
        monthlyDemands: monthDemands.length,
        monthlyResponses: monthResponses.length,
      };
    });

    setStatisticsData(monthlyStats);

    // 准备图表数据
    prepareChartData(monthlyStats);

    setLoading(false);
  };

  // 准备图表数据
  const prepareChartData = (stats) => {
    const months = stats.map((item) =>
      moment(item.startDate).format("YYYY-MM")
    );
    const demandCounts = stats.map((item) => item.monthlyDemands);
    const responseCounts = stats.map((item) => item.monthlyResponses);

    setChartData({
      months,
      demandCounts,
      responseCounts,
    });
  };

  // 生成图表配置
  const getChartOption = () => {
    if (!chartData) return {};

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: ["月累计发布服务需求数", "月累计响应成功服务数"],
        top: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: chartData.months,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "月累计发布服务需求数",
          type: chartType,
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: chartData.demandCounts,
          color: "#1890ff",
        },
        {
          name: "月累计响应成功服务数",
          type: chartType,
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: chartData.responseCounts,
          color: "#52c41a",
        },
      ],
    };

    return option;
  };

  return (
    <div style={{ padding: "20px", background: "#f0f2f5" }}>
      <Title level={1} style={{ marginBottom: 24, textAlign: "center" }}>
        统计分析
      </Title>

      {/* 查询表单 */}
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          initialValues={{
            region: "全部地域",
          }}
        >
          <Form.Item
            name="dateRange"
            label="时间范围"
            rules={[{ required: true, message: "请选择时间范围" }]}
          >
            <RangePicker
              picker="month"
              style={{ width: 300 }}
              format="YYYY-MM"
            />
          </Form.Item>

          <Form.Item name="region" label="地域">
            <Select style={{ width: 200 }}>
              {regions.map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                查询
              </Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 图表类型切换 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Text>图表类型：</Text>
          <Space>
            <Button
              type={chartType === "line" ? "primary" : "default"}
              icon={<LineChartOutlined />}
              onClick={() => setChartType("line")}
            >
              折线图
            </Button>
            <Button
              type={chartType === "bar" ? "primary" : "default"}
              icon={<BarChartOutlined />}
              onClick={() => setChartType("bar")}
            >
              柱状图
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 图表 */}
      <Card style={{ marginBottom: 24 }}>
        <Spin spinning={loading} tip="加载中...">
          {chartData && (
            <div style={{ height: 400 }}>
              <ReactECharts option={getChartOption()} />
            </div>
          )}
        </Spin>
      </Card>

      {/* 统计数据列表 */}
      <Card>
        <Spin spinning={loading} tip="加载中...">
          <Table
            columns={columns}
            dataSource={statisticsData}
            rowKey="key"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Analytics;
