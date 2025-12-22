import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import antdTheme from "./config/theme";
import AppHeader from "./components/Header";

const { Content, Footer } = Layout;

function App() {
  return (
    <Layout>
      <AppHeader />
      <Content style={{ padding: "0 50px", margin: "20px 0" }}>
        <Outlet />
      </Content>
      <Footer
        style={{
          textAlign: "center",
          backgroundColor: antdTheme.token.colorBgContainer,
        }}
      >
        Good Service ©{new Date().getFullYear()} Created by Vite + React
      </Footer>
    </Layout>
  );
}

export default App;
