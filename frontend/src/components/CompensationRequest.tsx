import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { compensationService } from '../services/services';
import { toast } from 'react-hot-toast';
import { Calendar } from 'lucide-react';

interface CompensationRequestProps {
  currentBalance: number;
}

export default function CompensationRequest({ currentBalance }: CompensationRequestProps) {
  const [hours, setHours] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation(compensationService.create, {
    onSuccess: () => {
      toast.success('Solicitação de compensação criada com sucesso!');
      queryClient.invalidateQueries('hourBalance');
      setHours('');
      setDate('');
      setReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar solicitação');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(hours);

    if (hoursNum <= 0) {
      toast.error('Digite um valor válido de horas');
      return;
    }

    if (hoursNum > currentBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!date) {
      toast.error('Selecione uma data');
      return;
    }

    mutation.mutate({
      requestedHours: hoursNum,
      compensationDate: date,
      reason: reason || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
            Horas a Compensar
          </label>
          <input
            type="number"
            id="hours"
            step="0.5"
            min="0.5"
            max={currentBalance}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Saldo disponível: {currentBalance.toFixed(2)}h
          </p>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Data da Compensação
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            />
            <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Motivo (Opcional)
          </label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Ex: Folga em feriado"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {mutation.isLoading ? 'Enviando...' : 'Solicitar Compensação'}
        </button>
      </div>
    </form>
  );
}



