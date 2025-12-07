import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Pagination,
  Modal,
  Form,
  message,
  Checkbox,
  Typography,
  Empty,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Content } from '../types';
import { useContentStore } from '../stores/contentStore';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ContentListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    contents,
    categories,
    tags,
    pagination,
    loading,
    filters,
    fetchContents,
    updateContent,
    deleteContent,
    batchDeleteContents,
    setFilters,
  } = useContentStore();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    fetchContents({ ...filters, search: value });
  };

  const handlePlatformFilter = (platform: string) => {
    setFilters({ ...filters, platform });
    fetchContents({ ...filters, platform });
  };

  const handleCategoryFilter = (categoryId: number) => {
    setFilters({ ...filters, category: categoryId });
    fetchContents({ ...filters, category: categoryId });
  };

  const handlePageChange = (page: number) => {
    fetchContents({ ...filters, page });
  };

  const handleEdit = (content: Content) => {
    setEditingContent(content);
    form.setFieldsValue({
      title: content.title,
      description: content.description,
      categoryId: content.categoryId,
      tags: content.tags,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingContent) return;

    try {
      const values = form.getFieldsValue();
      await updateContent(editingContent.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      setEditingContent(null);
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个内容吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteContent(id);
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contents.map(content => content.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要删除的内容');
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedIds.length} 个内容吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await batchDeleteContents(selectedIds);
          message.success('批量删除成功');
          setSelectedIds([]);
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const renderMedia = (content: Content) => {
    if (content.contentType === 'video' && content.filePath) {
      return (
        <video
          className="content-video"
          src={content.filePath}
          controls
          poster={content.thumbnailPath}
        />
      );
    }

    if (content.contentType === 'image' && content.filePath) {
      return (
        <img
          className="content-image"
          src={content.filePath}
          alt={content.title}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.png';
          }}
        />
      );
    }

    return <div className="content-placeholder">无媒体文件</div>;
  };

  const buildCategoryOptions = (categories: any[]): React.ReactNode[] => {
    return categories.map((category) => [
      <Option key={category.id} value={category.id}>
        {category.name}
      </Option>,
      ...(category.children ? buildCategoryOptions(category.children) : []),
    ]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>内容管理</Title>
        <Button type="primary" onClick={() => navigate('/extract')}>
          提取新内容
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="search-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索标题或描述"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="筛选平台"
              allowClear
              style={{ width: '100%' }}
              onChange={handlePlatformFilter}
            >
              <Option value="douyin">抖音</Option>
              <Option value="xiaohongshu">小红书</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="筛选分类"
              allowClear
              style={{ width: '100%' }}
              onChange={handleCategoryFilter}
            >
              {buildCategoryOptions(categories)}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button
                type="primary"
                danger
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
              >
                批量删除 ({selectedIds.length})
              </Button>
              <Button icon={<FilterOutlined />}>更多筛选</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 内容列表 */}
      {contents.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Checkbox
                indeterminate={selectedIds.length > 0 && selectedIds.length < contents.length}
                checked={contents.length > 0 && selectedIds.length === contents.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                全选
              </Checkbox>
            </Col>
            {contents.map((content) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={content.id}>
                <Card
                  hoverable
                  className="content-card"
                  cover={
                    <div style={{ position: 'relative' }}>
                      {renderMedia(content)}
                      <Checkbox
                        style={{ position: 'absolute', top: 8, left: 8 }}
                        checked={selectedIds.includes(content.id)}
                        onChange={(e) => handleSelect(content.id, e.target.checked)}
                      />
                    </div>
                  }
                  actions={[
                    <EyeOutlined key="view" onClick={() => navigate(`/contents/${content.id}`} />,
                    <EditOutlined key="edit" onClick={() => handleEdit(content)} />,
                    <DeleteOutlined key="delete" onClick={() => handleDelete(content.id)} />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="content-title">
                        {content.title}
                        <span className={`platform-badge ${content.sourcePlatform}`}>
                          {content.sourcePlatform === 'douyin' ? '抖音' : '小红书'}
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <div className="content-description">
                          {content.description || '暂无描述'}
                        </div>
                        <div className="content-meta">
                          <Text type="secondary">
                            {dayjs(content.createdAt).format('YYYY-MM-DD')}
                          </Text>
                          {content.category && (
                            <Tag color="blue" size="small">
                              {content.category.name}
                            </Tag>
                          )}
                        </div>
                        {content.tags.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {content.tags.slice(0, 3).map((tag, index) => (
                              <Tag key={index} size="small">{tag}</Tag>
                            ))}
                            {content.tags.length > 3 && (
                              <Tag size="small">+{content.tags.length - 3}</Tag>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* 分页 */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
            />
          </div>
        </>
      ) : (
        <Empty
          description="暂无内容"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/extract')}>
            提取第一个内容
          </Button>
        </Empty>
      )}

      {/* 编辑弹窗 */}
      <Modal
        title="编辑内容"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingContent(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} />
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

export default ContentListPage;