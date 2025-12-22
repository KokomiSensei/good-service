import React from "react";
import { Card } from "antd";

const About = () => {
  return (
    <div>
      <h1>关于我们</h1>
      <Card title="项目信息">
        <p>这是一个使用 React + Vite 构建的项目</p>
        <p>路由管理：React Router</p>
        <p>状态管理：Zustand</p>
        <p>UI组件库：Ant Design</p>
        <p>HTTP请求：Axios</p>
        <p>图表库：ECharts</p>
      </Card>
    </div>
  );
};

export default About;
