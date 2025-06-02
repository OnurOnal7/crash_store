import { Layout, Card, Typography } from 'antd';
import DumpList from '../components/DumpList';
import './DumpListPage.css';

const { Content } = Layout;
const { Title } = Typography;

export default function DumpListPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content className="app-content">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Crash Dumps Dashboard
        </Title>

        <Card variant="borderless" styles={{ body: { padding: 0 } }}>          
          <DumpList />
        </Card>
      </Content>
    </Layout>
  );
}