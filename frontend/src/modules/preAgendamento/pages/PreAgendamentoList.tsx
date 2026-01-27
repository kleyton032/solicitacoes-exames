import { Card, Empty } from 'antd';

export function PreAgendamentoList() {
    return (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
            <Empty
                description={
                    <span style={{ fontSize: '1.1rem', color: '#666' }}>
                        Funcionalidade em desenvolvimento...
                    </span>
                }
            />
        </Card>
    );
}
