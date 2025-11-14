import { useQuery } from 'react-query';
import { dashboardService, hourBalanceService } from '../services/services';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import BalanceChart from '../components/BalanceChart';
import CompensationRequest from '../components/CompensationRequest';

export default function EmployeeDashboard() {
  const { data: balance, isLoading: balanceLoading } = useQuery(
    'hourBalance',
    hourBalanceService.getBalance,
  );

  const { data: dashboard, isLoading: dashboardLoading } = useQuery(
    'employeeDashboard',
    dashboardService.getEmployeeDashboard,
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'EXPIRED':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'Crítico';
      case 'WARNING':
        return 'Atenção';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return 'Normal';
    }
  };

  if (balanceLoading || dashboardLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe seu saldo de horas e solicite compensações
        </p>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Saldo Atual
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {balance?.balance?.toFixed(2) || '0.00'}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Status
                  </dt>
                  <dd
                    className={`text-lg font-semibold ${getStatusColor(balance?.status)} px-2 py-1 rounded inline-block`}
                  >
                    {getStatusLabel(balance?.status)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Válido até
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {balance?.validUntil
                      ? new Date(balance.validUntil).toLocaleDateString('pt-BR')
                      : 'Indefinido'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      {dashboard?.evolution && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Evolução do Saldo (Últimos 12 meses)
          </h2>
          <BalanceChart data={dashboard.evolution} />
        </div>
      )}

      {/* Solicitação de Compensação */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Solicitar Compensação
        </h2>
        <CompensationRequest currentBalance={balance?.balance || 0} />
      </div>
    </div>
  );
}



