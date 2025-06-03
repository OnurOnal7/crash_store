import { Layout, Card, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DumpList from '../components/DumpList';
import './DumpListPage.css';

const { Content } = Layout;

export default function DumpListPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const items: MenuProps['items'] = [
    { key: 'email', label: email, disabled: true, style: { color: 'black' } },
    { type: 'divider' },
    { key: 'logout', label: 'Sign out', style: { color: 'red', fontWeight: 'bold' } },
  ]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      navigate("/login", { replace: true });
    } 
  }

  return (
    <Layout
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Dropdown 
        menu={{ items, onClick: handleMenuClick }} 
        trigger={['click']} 
        placement="bottomRight"
      >
        <Avatar
          size={32}
          icon={<UserOutlined />}
          className='avatar-dropdown'
        />
      </Dropdown>
      
      <Content className="app-content">
        <Card variant="borderless" styles={{ body: { padding: 0 } }}>
          <DumpList />
        </Card>
      </Content>
    </Layout>  
  );
}