import { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

interface FileUploadProps {
  onUploadSuccess?: (result: any) => void;
  accept?: string;
  maxSize?: number; // em MB
}

export default function FileUpload({ 
  onUploadSuccess, 
  accept = '.txt,.xlsx,.xls',
  maxSize = 10 
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Valida extensão
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = accept.split(',').map(ext => ext.replace('.', ''));
    
    if (!extension || !allowedExtensions.includes(extension)) {
      toast.error(`Formato não suportado. Use: ${accept}`);
      return;
    }

    // Valida tamanho
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
    
    // Se for TXT, faz preview
    if (extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(l => l.trim()).slice(0, 5);
        setPreview({ type: 'txt', lines });
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/time-clock/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`✅ ${response.data.imported} registros importados com sucesso!`);
      
      if (response.data.errors > 0) {
        toast.error(`⚠️ ${response.data.errors} erros encontrados`);
      }

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Limpa estado
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao importar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
            }
          `}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-primary-600 font-medium">
                Clique para selecionar
              </span>
              <span className="text-gray-500"> ou arraste o arquivo aqui</span>
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept={accept}
              onChange={handleFileInput}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Formatos aceitos: TXT, XLSX, XLS (máx. {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {preview && preview.type === 'txt' && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview (primeiras 5 linhas):</p>
              <pre className="text-xs text-gray-600 font-mono overflow-x-auto">
                {preview.lines.join('\n')}
              </pre>
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Importar Arquivo</span>
                </>
              )}
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


