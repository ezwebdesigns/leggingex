import { useState } from 'react';
import CsvImport from '@/components/admin/CsvImport';

export default function AdminImport() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <CsvImport key={refreshKey} onImported={() => setRefreshKey((k) => k + 1)} />
  );
}
