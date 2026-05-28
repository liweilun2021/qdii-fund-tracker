import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import type { QDIIFund } from '../../../shared/types';
import { PurchaseStatus } from '../../../shared/types';

interface Props {
  funds: QDIIFund[];
  loading: boolean;
}

const StatsOverview: React.FC<Props> = ({ funds, loading }) => {
  const total = funds.length;
  const open = funds.filter((f) => f.purchaseStatus === PurchaseStatus.OPEN).length;
  const restricted = funds.filter((f) => f.purchaseStatus === PurchaseStatus.RESTRICTED).length;
  const suspended = funds.filter((f) => f.purchaseStatus === PurchaseStatus.SUSPENDED).length;

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic title="QDII基金总数" value={total} loading={loading} />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="正常申购"
            value={open}
            loading={loading}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="限制大额"
            value={restricted}
            loading={loading}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="暂停申购"
            value={suspended}
            loading={loading}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsOverview;
