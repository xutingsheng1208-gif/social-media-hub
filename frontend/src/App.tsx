import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContentListPage from './pages/ContentListPage';
import ContentDetailPage from './pages/ContentDetailPage';
import ExtractPage from './pages/ExtractPage';
import CategoriesPage from './pages/CategoriesPage';
import TagsPage from './pages/TagsPage';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contents" element={<ContentListPage />} />
            <Route path="/contents/:id" element={<ContentDetailPage />} />
            <Route path="/extract" element={<ExtractPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/tags" element={<TagsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;