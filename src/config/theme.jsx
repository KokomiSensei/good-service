import { theme } from "antd";

// 使用CSS变量定义Ant Design主题
const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "var(--primary-color)",
    colorSuccess: "var(--success-color)",
    colorWarning: "var(--warning-color)",
    colorError: "var(--error-color)",
    colorText: "var(--text-main)",
    colorTextSecondary: "var(--text-secondary)",
    colorBgContainer: "var(--bg-container)",
    colorBorder: "var(--border-color)",
    colorLink: "var(--link-color)",
  },
};

export default antdTheme;
