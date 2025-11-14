import { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardService } from '../services/services';
import { Users, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import BalanceChart from '../components/BalanceChart';

export default function ManagerDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: dashboard, isLoading } = useQuery(
    'managerDashboard',
    dashboardService.getManagerDashboard,
  );

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'Crítico';
      case 'WARNING':
        return 'Atenção';
      case 'NORMAL':
        return 'Normal';
      default:
        return status;
    }
  };

  // Filtra dados da equipe
  const filteredTeamData = dashboard?.teamData?.filter((member: any) => {
    if (statusFilter === 'all') return true;
    return member.status === statusFilter;
  }) || [];

  // Prepara dados para gráfico
  const chartData = dashboard?.teamData?.map((member: any) => ({
    month: member.name.substring(0, 10),
    balance: member.balance,
  })) || [];

  const handleExport = () => {
    // Implementar exportação CSV
    const csv = [
      ['Colaborador', 'Email', 'Saldo', 'Status'],
      ...(filteredTeamData.map((m: any) => [
        m.name,
        m.email,
        m.balance.toFixed(2),
        getStatusLabel(m.status),
      ])),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipe-saldo-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard da Equipe</h1>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe os saldos de horas da sua equipe
        </p>
      </div>

      {/* Estatísticas */}
      {dashboard?.statistics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-primary-600" />
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total de Colaboradores</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboard.statistics.totalEmployees}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Críticos</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {dashboard.statistics.criticalCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Atenção</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {dashboard.statistics.warningCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Saldo Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboard.statistics.totalBalance.toFixed(2)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Distribuição */}
      {chartData.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Distribuição de Saldos da Equipe
          </h2>
          <BalanceChart data={chartData} />
        </div>
      )}

      {/* Filtros e Tabela da Equipe */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Saldo da Equipe</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="NORMAL">Normal</option>
                  <option value="WARNING">Atenção</option>
                  <option value="CRITICAL">Crítico</option>
                </select>
              </div>
            </div>
          </div>

          <DataTable
            data={filteredTeamData}
            columns={[
              { header: 'Colaborador', accessor: 'name', sortable: true },
              { header: 'Email', accessor: 'email', sortable: true },
              {
                header: 'Saldo',
                accessor: (row) => `${row.balance.toFixed(2)}h`,
                sortable: true,
              },
              {
                header: 'Status',
                accessor: (row) => (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(row.status)}`}
                  >
                    {getStatusLabel(row.status)}
                  </span>
                ),
              },
            ]}
            searchable={true}
            searchPlaceholder="Buscar colaborador..."
            onExport={handleExport}
            exportLabel="Exportar CSV"
          />
        </div>
      </div>
    </div>
  );
}


