import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import { router } from "./routes";
import "./index.css";
import antdTheme from "./config/theme";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>
);
