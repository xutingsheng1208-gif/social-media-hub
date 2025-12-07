import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  DatabaseOutlined,
  FolderOutlined,
  TagsOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useContentStore } from '../stores/contentStore';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { contents, categories, tags, fetchCategories, fetchTags } = useContentStore();

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  const recentContents = contents.slice(0, 6);

  return (
    <div>
      {/* 欢迎区域 */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <Title level={2}>欢迎使用社交媒体资源库</Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
          轻松提取、保存、搜索和管理抖音、小红书的内容
        </Paragraph>
        <Space size="large">
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            <Link to="/extract">提取内容</Link>
          </Button>
          <Button size="large" icon={<DatabaseOutlined />}>
            <Link to="/contents">浏览内容</Link>
          </Button>
        </Space>
      </div>

      {/* 统计数据 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总内容数"
              value={contents.length}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类数"
              value={categories.length}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="标签数"
              value={tags.length}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={0} // TODO: 实现今日新增统计
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={24} lg={12}>
          <Card title="快速操作" extra={<ArrowRightOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<PlusOutlined />}>
                <Link to="/extract">提取新内容</Link>
              </Button>
              <Button block icon={<DatabaseOutlined />}>
                <Link to="/contents">管理内容</Link>
              </Button>
              <Button block icon={<FolderOutlined />}>
                <Link to="/categories">管理分类</Link>
              </Button>
              <Button block icon={<TagsOutlined />}>
                <Link to="/tags">管理标签</Link>
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近添加" extra={<Link to="/contents">查看全部</Link>}>
            {recentContents.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {recentContents.map((content) => (
                  <div key={content.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{content.title}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {new Date(content.createdAt).toLocaleDateString()}
                      <span className={`platform-badge ${content.sourcePlatform}`} style={{ marginLeft: 8 }}>
                        {content.sourcePlatform === 'douyin' ? '抖音' : '小红书'}
                      </span>
                    </div>
                  </div>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 32 }}>
                暂无内容，<Link to="/extract">立即提取</Link>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 使用说明 */}
      <Card title="使用说明">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📱</div>
              <Title level={4}>1. 复制链接</Title>
              <Paragraph>在抖音或小红书上复制感兴趣的内容链接</Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🎯</div>
              <Title level={4}>2. 提取内容</Title>
              <Paragraph>粘贴链接到提取页面，自动解析并保存内容</Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
              <Title level={4}>3. 搜索管理</Title>
              <Paragraph>使用搜索、分类、标签等功能管理内容</Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;