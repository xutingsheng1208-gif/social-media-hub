import React, { useEffect, useState } from 'react';
import {
  Card,
  Tree,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Typography,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { Category } from '../types';
import { useContentStore } from '../stores/contentStore';

const { Title } = Typography;
const { Option } = Select;

interface DataNode {
  title: React.ReactNode;
  key: string;
  data: Category;
  children?: DataNode[];
}

const CategoriesPage: React.FC = () => {
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
  } = useContentStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const buildTreeData = (categories: Category[]): DataNode[] => {
    return categories
      .filter(category => !category.parentId)
      .map(category => ({
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <FolderOutlined style={{ marginRight: 8 }} />
              {category.name}
              {category._count && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {category._count.contents}
                </Tag>
              )}
            </span>
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<FolderAddOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubCategory(category);
                }}
              />
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(category);
                }}
              />
              <Popconfirm
                title="确认删除"
                description="确定要删除这个分类吗？"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(category.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Space>
          </div>
        ),
        key: category.id.toString(),
        data: category,
        children: buildSubTreeData(categories, category.id),
      }));
  };

  const buildSubTreeData = (categories: Category[], parentId: number): DataNode[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => ({
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {category.name}
              {category._count && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {category._count.contents}
                </Tag>
              )}
            </span>
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(category);
                }}
              />
              <Popconfirm
                title="确认删除"
                description="确定要删除这个分类吗？"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(category.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Space>
          </div>
        ),
        key: category.id.toString(),
        data: category,
      }));
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddSubCategory = (parentCategory: Category) => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ parentId: parentCategory.id });
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      parentId: category.parentId,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();

      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await createCategory(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error(editingCategory ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getParentOptions = (categories: Category[], excludeId?: number): React.ReactNode[] => {
    return categories
      .filter(category => !category.parentId && category.id !== excludeId)
      .map(category => (
        <Option key={category.id} value={category.id}>
          {category.name}
        </Option>
      ));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>分类管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
          新建分类
        </Button>
      </div>

      <Card>
        <Tree
          showIcon
          defaultExpandAll
          treeData={buildTreeData(categories)}
          loading={loading}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          {!editingCategory && (
            <Form.Item label="父分类" name="parentId">
              <Select placeholder="请选择父分类（可选）" allowClear>
                {getParentOptions(categories)}
              </Select>
            </Form.Item>
          )}
          {editingCategory && !editingCategory.parentId && (
            <Form.Item label="父分类" name="parentId">
              <Select placeholder="请选择父分类（可选）" allowClear>
                {getParentOptions(categories, editingCategory.id)}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;