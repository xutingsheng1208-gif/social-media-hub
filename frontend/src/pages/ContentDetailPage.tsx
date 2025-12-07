import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Image,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Select,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Content } from '../types';
import { useContentStore } from '../stores/contentStore';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentContent,
    categories,
    tags,
    loading,
    fetchContent,
    updateContent,
    deleteContent,
  } = useContentStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchContent(Number(id));
    }
  }, [id, fetchContent]);

  const handleEdit = () => {
    if (currentContent) {
      form.setFieldsValue({
        title: currentContent.title,
        description: currentContent.description,
        categoryId: currentContent.categoryId,
        tags: currentContent.tags,
      });
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!currentContent) return;

    try {
      const values = form.getFieldsValue();
      await updateContent(currentContent.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchContent(Number(id));
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async () => {
    if (!currentContent) return;

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个内容吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteContent(currentContent.id);
          message.success('删除成功');
          navigate('/contents');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleShare = () => {
    if (currentContent?.sourceUrl) {
      navigator.clipboard.writeText(currentContent.sourceUrl);
      message.success('链接已复制到剪贴板');
    }
  };

  const renderMedia = (content: Content) => {
    if (content.contentType === 'video' && content.filePath) {
      return (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <video
            style={{ width: '100%', maxWidth: 600, borderRadius: 8 }}
            src={content.filePath}
            controls
            poster={content.thumbnailPath}
          />
        </div>
      );
    }

    if (content.contentType === 'image' && content.filePath) {
      return (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Image
            style={{ maxWidth: '100%', borderRadius: 8 }}
            src={content.filePath}
            alt={content.title}
            fallback="/placeholder-image.png"
          />
        </div>
      );
    }

    return null;
  };

  const buildCategoryOptions = (categories: any[]): React.ReactNode[] => {
    return categories.map((category) => [
      <Option key={category.id} value={category.id}>
        {category.name}
      </Option>,
      ...(category.children ? buildCategoryOptions(category.children) : []),
    ]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentContent) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Title level={3}>内容不存在</Title>
        <Button type="primary" onClick={() => navigate('/contents')}>
          返回内容列表
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 操作栏 */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/contents')}
          >
            返回列表
          </Button>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleShare}
            disabled={!currentContent.sourceUrl}
          >
            分享原链接
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            删除
          </Button>
        </Space>
      </div>

      {/* 内容详情 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Title level={2}>{currentContent.title}</Title>
              <Space wrap>
                <Tag color={currentContent.sourcePlatform === 'douyin' ? 'red' : 'pink'}>
                  {currentContent.sourcePlatform === 'douyin' ? '抖音' : '小红书'}
                </Tag>
                {currentContent.category && (
                  <Tag color="blue">{currentContent.category.name}</Tag>
                )}
              </Space>
            </div>

            {renderMedia(currentContent)}

            {currentContent.description && (
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>内容描述</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  {currentContent.description}
                </Paragraph>
              </div>
            )}

            {currentContent.tags.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>标签</Title>
                <Space wrap>
                  {currentContent.tags.map((tag, index) => (
                    <Tag key={index} color="default">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="内容信息">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>内容ID：</Text>
                <Text>{currentContent.id}</Text>
              </div>
              <div>
                <Text strong>来源平台：</Text>
                <Text>
                  {currentContent.sourcePlatform === 'douyin' ? '抖音' : '小红书'}
                </Text>
              </div>
              <div>
                <Text strong>内容类型：</Text>
                <Text>
                  {currentContent.contentType === 'video' ? '视频' : '图片'}
                </Text>
              </div>
              {currentContent.sourceUrl && (
                <div>
                  <Text strong>原始链接：</Text>
                  <div>
                    <a
                      href={currentContent.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      查看原文
                    </a>
                  </div>
                </div>
              )}
              <div>
                <Text strong>创建时间：</Text>
                <div>{dayjs(currentContent.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
              <div>
                <Text strong>更新时间：</Text>
                <div>{dayjs(currentContent.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
            </Space>
          </Card>

          <Card title="操作" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<EditOutlined />} onClick={handleEdit}>
                编辑内容
              </Button>
              {currentContent.sourceUrl && (
                <Button block icon={<ShareAltOutlined />} onClick={handleShare}>
                  复制原链接
                </Button>
              )}
              <Button
                block
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                删除内容
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑内容"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="分类" name="categoryId">
            <Select placeholder="选择分类" allowClear>
              {buildCategoryOptions(categories)}
            </Select>
          </Form.Item>
          <Form.Item label="标签" name="tags">
            <Select
              mode="tags"
              placeholder="添加标签"
              style={{ width: '100%' }}
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentDetailPage;