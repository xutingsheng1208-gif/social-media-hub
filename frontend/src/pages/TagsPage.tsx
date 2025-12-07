import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Typography,
  Tag,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MergeOutlined,
} from '@ant-design/icons';
import { Tag as TagType } from '../types';
import { useContentStore } from '../stores/contentStore';
import dayjs from 'dayjs';

const { Title } = Typography;

const TagsPage: React.FC = () => {
  const {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    fetchTags,
  } = useContentStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [mergeModalVisible, setMergeModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [mergeForm] = Form.useForm();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag>{name}</Tag>,
    },
    {
      title: '使用次数',
      dataIndex: '_count',
      key: 'count',
      render: (count: { contents: number }) => count.contents,
      sorter: (a: any, b: any) => a._count.contents - b._count.contents,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a: any, b: any) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: TagType) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除"
            description="确定要删除这个标签吗？"
            onConfirm={() => handleDelete(record.id)}
            disabled={record._count?.contents > 0}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record._count?.contents > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddTag = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();

      if (editingTag) {
        await updateTag(editingTag.id, values);
        message.success('更新成功');
      } else {
        await createTag(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
      fetchTags();
    } catch (error) {
      message.error(editingTag ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id);
      message.success('删除成功');
      fetchTags();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleMerge = async () => {
    try {
      const values = mergeForm.getFieldsValue();
      // TODO: 实现标签合并功能
      console.log('Merge tags:', values);
      message.success('合并成功');
      setMergeModalVisible(false);
      mergeForm.resetFields();
      fetchTags();
    } catch (error) {
      message.error('合并失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>标签管理</Title>
        <Space>
          <Button icon={<MergeOutlined />} onClick={() => setMergeModalVisible(true)}>
            合并标签
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
            新建标签
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新建/编辑标签弹窗 */}
      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标签名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 合并标签弹窗 */}
      <Modal
        title="合并标签"
        open={mergeModalVisible}
        onOk={handleMerge}
        onCancel={() => {
          setMergeModalVisible(false);
          mergeForm.resetFields();
        }}
      >
        <Form form={mergeForm} layout="vertical">
          <Form.Item label="源标签" name="sourceTagId" rules={[{ required: true, message: '请选择源标签' }]}>
            <Select placeholder="请选择要被合并的标签">
              {tags.map(tag => (
                <Select.Option key={tag.id} value={tag.id}>
                  {tag.name} ({tag._count?.contents || 0} 个内容)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="目标标签" name="targetTagId" rules={[{ required: true, message: '请选择目标标签' }]}>
            <Select placeholder="请选择合并到的目标标签">
              {tags.map(tag => (
                <Select.Option key={tag.id} value={tag.id}>
                  {tag.name} ({tag._count?.contents || 0} 个内容)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagsPage;