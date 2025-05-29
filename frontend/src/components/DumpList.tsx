import { useEffect, useState } from "react";
import { fetchDumps, downloadDump, deleteDump } from "../api/dumps"
import type { CrashDump } from "../types/crashDump";
import { Table, Space, Popconfirm, message } from "antd";

const { Column } = Table;

export default function DumpList() {
    const [dumps, setDumps] = useState<CrashDump[]>([]);
    const [loading, setLoading] = useState(true);
      const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchDumps()
        .then(setDumps)
        .catch(err => {
            console.error(err);
            messageApi.error("Failed to load dumps");
        })
        .finally(() => setLoading(false));
    }, []);

    const handleDownload = async (id: number, name: string) => {
        try {
            await downloadDump(id, name);
            messageApi.success(`Dump downloaded: ${name}`);
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
        }
        catch (err) {
            console.error(err);
            messageApi.error("Delete failed");
        }
    };

    return (
        <>
            {contextHolder}

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
                        </Space>
                    )}
                />
            </Table>
        </>  
    )
}
