import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Space,
  Divider,
  Typography,
  Alert,
  Spin,
} from 'antd';
import { extractApi } from '../services/api';
import { useContentStore } from '../stores/contentStore';
import { ExtractPreview } from '../types';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ExtractPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<ExtractPreview | null>(null);
  const { categories, createContent } = useContentStore();

  const handleDetect = async () => {
    const url = form.getFieldValue('url');
    if (!url) {
      message.error('请输入URL');
      return;
    }

    setLoading(true);
    try {
      const result = await extractApi.detectUrl(url);
      form.setFieldsValue({ platform: result.platform });
      message.success(`检测到平台: ${result.platform === 'douyin' ? '抖音' : '小红书'}`);
    } catch (error) {
      message.error('URL检测失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    const url = form.getFieldValue('url');
    const platform = form.getFieldValue('platform');

    if (!url || !platform) {
      message.error('请输入URL并选择平台');
      return;
    }

    setPreviewLoading(true);
    try {
      const previewData = await extractApi.previewContent(url, platform);
      setPreview(previewData);
      message.success('预览成功');
    } catch (error) {
      message.error('预览失败');
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExtract = async () => {
    const values = form.getFieldsValue();

    if (!values.url || !values.platform) {
      message.error('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const contentData = {
        url: values.url,
        platform: values.platform,
        categoryId: values.categoryId,
        tags: values.tags || [],
      };

      await createContent(contentData);
      message.success('内容提取并保存成功');
      form.resetFields();
      setPreview(null);
    } catch (error) {
      message.error('内容提取失败');
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryOptions = (categories: any[], level = 0): React.ReactNode[] => {
    return categories.map((category) => [
      <Option key={category.id} value={category.id}>
        {'  '.repeat(level) + category.name}
      </Option>,
      ...(category.children ? buildCategoryOptions(category.children, level + 1) : []),
    ]);
  };

  return (
    <div>
      <Title level={2}>提取内容</Title>
      <Paragraph type="secondary">
        输入抖音或小红书的链接，自动提取并保存到资源库
      </Paragraph>

      <Card>
        <Form form={form} layout="vertical">
          <Form.Item
            label="内容链接"
            name="url"
            rules={[{ required: true, message: '请输入内容链接' }]}
          >
            <Input.Search
              placeholder="请输入抖音或小红书的内容链接"
              enterButton="检测"
              loading={loading}
              onSearch={handleDetect}
            />
          </Form.Item>

          <Form.Item
            label="平台"
            name="platform"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="请选择平台">
              <Option value="douyin">抖音</Option>
              <Option value="xiaohongshu">小红书</Option>
            </Select>
          </Form.Item>

          <Form.Item label="分类" name="categoryId">
            <Select placeholder="请选择分类（可选）" allowClear>
              {buildCategoryOptions(categories)}
            </Select>
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Select
              mode="tags"
              placeholder="输入标签，按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider />

          <Space>
            <Button
              type="default"
              onClick={handlePreview}
              loading={previewLoading}
            >
              预览内容
            </Button>
            <Button
              type="primary"
              onClick={handleExtract}
              loading={loading}
            >
              提取并保存
            </Button>
          </Space>
        </Form>
      </Card>

      {previewLoading && (
        <Card style={{ marginTop: 24, textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>正在解析内容...</div>
        </Card>
      )}

      {preview && (
        <Card title="内容预览" style={{ marginTop: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={4}>{preview.title}</Title>
              <Paragraph>{preview.description}</Paragraph>
            </div>

            <div>
              <strong>作者：</strong>{preview.author}
            </div>

            <div>
              <strong>标签：</strong>
              <Space wrap>
                {preview.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </Space>
            </div>

            {preview.images && preview.images.length > 0 && (
              <div>
                <strong>图片：</strong>
                <div>检测到 {preview.images.length} 张图片</div>
              </div>
            )}

            {preview.videoUrl && (
              <div>
                <strong>视频：</strong>
                <div>检测到视频内容</div>
              </div>
            )}

            <Alert
              message="预览成功"
              description="点击"提取并保存"按钮将内容保存到资源库"
              type="success"
              showIcon
            />
          </Space>
        </Card>
      )}

      <Card title="使用说明" style={{ marginTop: 24 }}>
        <Space direction="vertical" size="middle">
          <div>
            <strong>支持平台：</strong>抖音、小红书
          </div>
          <div>
            <strong>支持内容：</strong>视频、图文
          </div>
          <div>
            <strong>使用步骤：</strong>
            <ol>
              <li>复制抖音或小红书的内容链接</li>
              <li>粘贴到上方输入框</li>
              <li>点击"检测"自动识别平台</li>
              <li>可选：预览内容、选择分类、添加标签</li>
              <li>点击"提取并保存"完成</li>
            </ol>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ExtractPage;