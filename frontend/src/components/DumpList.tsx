import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDumps, downloadDump, deleteDump, patchArchived } from "../features/dumps/api";
import type { CrashDump } from "../features/dumps/types";
import { Table, Space, Popconfirm, Checkbox, message, Typography, Popover } from "antd";
import './DumpList.css';

const { Column } = Table;
const { Title } = Typography;

export default function DumpList() {
  const [dumps, setDumps] = useState<CrashDump[]>([]);
  const [archivedDumps, setArchivedDumps] = useState<CrashDump[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedArchive, setCheckedArchive] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDumps = async () => {
      setLoading(true);
      try {
        const data = await fetchDumps();
        const sorted = data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setDumps(sorted.filter(d => !d.archived));
        setArchivedDumps(sorted.filter(d => d.archived));
      } catch (err) {
        console.error(err);
        messageApi.error("Failed to load dumps");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadDumps();
  }, [messageApi, navigate]);

  const handleDownload = async (id: number, name: string) => {
    try {
      await downloadDump(id, name);
      messageApi.success("Dump downloaded");
    } catch (err) {
      console.error(err);
      messageApi.error("Download failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDump(id);
      setDumps(dumps.filter(d => d.id !== id));
      messageApi.success("Dump deleted");
    } catch (err) {
      console.error(err);
      messageApi.error("Delete failed");
    }
  };

  const handleArchive = async (dump: CrashDump) => {
    try {
      const updated = await patchArchived(dump.id, true);
      setDumps(prev => prev.filter(d => d.id !== dump.id));
      setArchivedDumps(prev => [...prev, updated]);
      messageApi.success("Dump archived");
    } catch (err) {
      console.error(err);
      messageApi.error("Archive failed");
    }
  }

  const handleUnarchive = async (dump: CrashDump) => {
    try {
      const updated = await patchArchived(dump.id, false);
      setDumps(prev => [...prev, updated]);
      setArchivedDumps(prev => prev.filter(d => d.id !== dump.id));
      messageApi.success("Dump unarchived");  
    } catch (err) {
      console.error(err);
      messageApi.error("Unarchive failed"); 
    }
  }

  return (
    <>
      {contextHolder}

      <Table<CrashDump>
        title={() => (
          <div className="table-header">
            <Title level={3} className="table-title">
              Crash Dumps Dashboard
            </Title>            
            <Checkbox
              checked={checkedArchive}
              onChange={e => setCheckedArchive(e.target.checked)}
              className="archive-checkbox"
            >
              Show Archived
            </Checkbox>
          </div>
        )}
        dataSource={checkedArchive ? [...dumps, ...archivedDumps] : dumps}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8, position: ['bottomRight'] }}
        style={{ tableLayout: 'fixed' }}
        scroll={{ x: 'max-content' }}
      >            
        <Column 
          title="Filename" 
          dataIndex="original_name" 
          key="original_name"
          width={250}
        />
        <Column
          title="Uploaded At"    
          dataIndex="time"
          key="time"
          width={200}
          render={ts => new Date(ts).toLocaleString()}
          sorter={(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()}
        />
        <Column
          title="Label"
          dataIndex="label"
          key="label"
          width={150}
          sorter={(a, b) => (a.label || '').localeCompare(b.label || '')}
        />
        <Column
          title="Actions"
          key="actions"
          width={120}
          render={(_: any, record: CrashDump) => (
            <Space size="large">
              <a onClick={() => handleDownload(record.id, record.original_name)}>Download</a>
              <Popconfirm
                title="Are you sure you want to delete this dump?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <a style={{ color: 'red' }}>Delete</a>
              </Popconfirm>
              <a 
                onClick={() => record.archived ? handleUnarchive(record) : handleArchive(record)} 
                style={{ color: record.archived ? "#28a745" : "#6c757d" }}
              >
                {record.archived ? "Unarchive" : "Archive"}
              </a>
            </Space>
          )}
        />
        <Column
          title="Description"
          dataIndex="description"
          width={150}
          render={text =>
            text ? (
              <Popover content={<div style={{ maxWidth: 300 }}>{text}</div>}>
                <span style={{ cursor: 'pointer', color: '#1890ff', fontWeight: 500 }}>
                  View
                </span>
              </Popover>
            ) : (
              <em>—</em>
            )
          }
        />
      </Table>
    </>  
  )
}
