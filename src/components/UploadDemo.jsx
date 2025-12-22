import React, { useState, useRef } from "react";
import {
  Card,
  Upload,
  Button,
  Input,
  message,
  Progress,
  Space,
  Typography,
  Row,
  Col,
  Image,
  Video,
} from "antd";
import {
  UploadOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { uploadUtils } from "../utils/upload";

const { Title, Text } = Typography;

const UploadDemo = () => {
  // 状态管理
  const [imageList, setImageList] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [textSubmitted, setTextSubmitted] = useState(false);

  // 视频上传输入框引用
  const videoInputRef = useRef(null);

  // 处理图片上传
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const result = await uploadUtils.uploadFile(file, {
        type: "image",
        onProgress: (progress) => setUploadProgress(progress),
      });

      // 添加到图片列表
      setImageList((prev) => [
        ...prev,
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: result.url,
        },
      ]);

      onSuccess(result);
      message.success("图片上传成功");
    } catch (error) {
      onError(error);
      message.error(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 处理视频文件选择
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      // 生成预览
      const previewUrl = uploadUtils.generatePreviewUrl(file);
      setVideoPreview(previewUrl);
    }
  };

  // 处理视频上传
  const handleVideoUpload = async () => {
    if (!videoFile) {
      message.warning("请先选择视频文件");
      return;
    }

    try {
      setUploading(true);
      await uploadUtils.uploadVideo(videoFile, {
        onProgress: (progress) => setUploadProgress(progress),
      });

      message.success("视频上传成功");
    } catch (error) {
      message.error(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 处理文字提交
  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      message.warning("请输入文字内容");
      return;
    }

    try {
      setUploading(true);
      await uploadUtils.submitText(textContent);

      setTextSubmitted(true);
      message.success("文字提交成功");
    } catch (error) {
      message.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  // 移除图片
  const handleRemoveImage = (file) => {
    setImageList((prev) => prev.filter((item) => item.uid !== file.uid));
    return true;
  };

  // 清理预览URL
  React.useEffect(() => {
    return () => {
      if (videoPreview) {
        uploadUtils.revokePreviewUrl(videoPreview);
      }
    };
  }, [videoPreview]);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        上传工具模块演示
      </Title>

      <Row gutter={[16, 16]}>
        {/* 图片上传区域 */}
        <Col span={24}>
          <Card title="图片上传" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Upload
                name="image"
                listType="picture-card"
                fileList={imageList}
                customRequest={handleImageUpload}
                onRemove={handleRemoveImage}
                multiple
                beforeUpload={() => false} // 禁用自动上传
              >
                {imageList.length >= 8 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress percent={uploadProgress} status="active" />
              )}
            </Space>
          </Card>
        </Col>

        {/* 视频上传区域 */}
        <Col span={24}>
          <Card title="视频上传" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
              >
                选择视频文件
              </Button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleVideoSelect}
              />

              {videoPreview && (
                <Card size="small" title="视频预览">
                  <Video width="100%" src={videoPreview} controls />
                </Card>
              )}

              {videoFile && (
                <Button
                  type="primary"
                  onClick={handleVideoUpload}
                  disabled={uploading}
                  loading={uploading && !!videoFile}
                >
                  上传视频
                </Button>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress percent={uploadProgress} status="active" />
              )}
            </Space>
          </Card>
        </Col>

        {/* 文字提交区域 */}
        <Col span={24}>
          <Card title="文字内容提交" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Input.TextArea
                rows={4}
                placeholder="请输入文字内容"
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  setTextSubmitted(false);
                }}
                disabled={textSubmitted}
              />

              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={handleTextSubmit}
                disabled={uploading || textSubmitted}
              >
                提交文字
              </Button>

              {textSubmitted && (
                <Card size="small" title="已提交的文字内容">
                  <Text>{textContent}</Text>
                </Card>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UploadDemo;
