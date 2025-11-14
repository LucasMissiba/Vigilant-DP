import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Users,
  FileText,
  Settings,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Upload,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  adminDashboardService,
  usersService,
  rulesService,
  timeClockService,
} from '../services/services';
import FileUpload from '../components/FileUpload';
import DataTable from '../components/DataTable';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rules' | 'import'>('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingRule, setEditingRule] = useState<any>(null);

  // Queries
  const { data: dashboard, isLoading } = useQuery(
    'adminDashboard',
    adminDashboardService.get,
  );

  const { data: users } = useQuery('users', usersService.list);
  const { data: rules } = useQuery('rules', () => rulesService.list(true));

  // Mutations
  const deleteUserMutation = useMutation(usersService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      queryClient.invalidateQueries('adminDashboard');
      toast.success('Usuário removido com sucesso');
    },
  });

  const deleteRuleMutation = useMutation(rulesService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('rules');
      queryClient.invalidateQueries('adminDashboard');
      toast.success('Regra removida com sucesso');
    },
  });

  const handleImportSuccess = () => {
    queryClient.invalidateQueries('adminDashboard');
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  const stats = dashboard?.statistics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie usuários, regras e importações do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'rules', label: 'Regras', icon: Settings },
            { id: 'import', label: 'Importar Ponto', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Usuários
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers || 0}
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
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Saldos Críticos
                      </dt>
                      <dd className="text-2xl font-semibold text-red-600">
                        {stats.criticalCount || 0}
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
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Regras Ativas
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.activeRules || 0}
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
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Compensações Pendentes
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.pendingCompensations || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Últimas Importações */}
          {dashboard?.recentImports && dashboard.recentImports.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Últimas Importações
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Arquivo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Funcionário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.recentImports.map((imp: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {imp.fileName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {imp.employeeName} ({imp.employeeId})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(imp.date).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
            <button
              onClick={handleCreateUser}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </button>
          </div>

          <DataTable
            data={users || []}
            columns={[
              { header: 'Nome', accessor: 'name', sortable: true },
              { header: 'Email', accessor: 'email', sortable: true },
              { header: 'Função', accessor: 'role', sortable: true },
              {
                header: 'Status',
                accessor: (row) => (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      row.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {row.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                ),
              },
              {
                header: 'Ações',
                accessor: (row) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(row)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este usuário?')) {
                          deleteUserMutation.mutate(row.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Regras</h2>
            <button
              onClick={handleCreateRule}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Regra</span>
            </button>
          </div>

          <DataTable
            data={rules || []}
            columns={[
              { header: 'Nome', accessor: 'name', sortable: true },
              { header: 'Código', accessor: 'code', sortable: true },
              { header: 'Tipo', accessor: 'ruleType', sortable: true },
              {
                header: 'Status',
                accessor: (row) => (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      row.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {row.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                ),
              },
              {
                header: 'Ações',
                accessor: (row) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRule(row)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover esta regra?')) {
                          deleteRuleMutation.mutate(row.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'import' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Importar Arquivo de Ponto
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Faça upload do arquivo TXT ou Excel com os registros de ponto eletrônico.
              O sistema processará automaticamente e calculará as horas extras.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <FileUpload onUploadSuccess={handleImportSuccess} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Formatos Suportados:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>TXT:</strong> PIS;Nome;Data;Hora1;Hora2;Hora3;Hora4 ou
                Matricula|Nome|Data|Hora1|Hora2|Hora3|Hora4
              </li>
              <li>
                <strong>Excel:</strong> Colunas: employeeId/PIS/Matricula, date/data,
                entry1/entrada1, exit1/saida1, etc.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal de Usuário (simplificado - pode ser expandido) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Funcionalidade de criação/edição de usuários em desenvolvimento.
            </p>
            <button
              onClick={() => setShowUserModal(false)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Regra (simplificado - pode ser expandido) */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRule ? 'Editar Regra' : 'Nova Regra'}
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Funcionalidade de criação/edição de regras em desenvolvimento.
            </p>
            <button
              onClick={() => setShowRuleModal(false)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
