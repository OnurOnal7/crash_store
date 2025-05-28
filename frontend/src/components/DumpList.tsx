import { useEffect, useState } from "react";
import { fetchDumps, downloadDump } from "../api/dumps"
import type { CrashDump } from "../types/crashDump";
import { Table, Space } from "antd";
const { Column } = Table;

const DumpList = () => {
    const [dumps, setDumps] = useState<CrashDump[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetchDumps()
        .then(setDumps)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    return (
        <Table<CrashDump>
        dataSource={dumps}
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
                defaultSortOrder="descend"
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
                render={(_, record) => (
                    <Space>
                        <a onClick={() => downloadDump(record.id, record.original_name)}>Download</a>
                    </Space>
                )}
            />
        </Table>
    )
}

export default DumpList