import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface CSVImportResultsProps {
  result: {
    success: boolean;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    errors: string[];
  } | null;
  csvType?: string;
  onClose: () => void;
}

const CSVImportResults: React.FC<CSVImportResultsProps> = ({ result, csvType, onClose }) => {
  if (!result) return null;

  const { success, totalRows, successfulRows, failedRows, errors } = result;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            CSV Import Results {csvType && `- ${csvType.charAt(0).toUpperCase() + csvType.slice(1)}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${
            success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <p className={`font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>
                {success ? 'Import Completed' : 'Import Failed'}
              </p>
              <p className={`text-sm ${success ? 'text-green-600' : 'text-red-600'}`}>
                {successfulRows > 0 
                  ? `${successfulRows} of ${totalRows} records imported successfully`
                  : 'No records were imported'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{totalRows}</div>
            <div className="text-sm text-blue-600">Total Rows</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{successfulRows}</div>
            <div className="text-sm text-green-600">Successful</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{failedRows}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-5 w-5 text-amber-600" />
              <h4 className="font-medium text-gray-900">Issues Found</h4>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-amber-800">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Tips for successful imports:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure all required fields are filled</li>
            <li>• Use the correct data formats (numbers for prices, dates in ISO format)</li>
            <li>• Check that categories and products exist before importing inventory/orders</li>
            <li>• Remove any extra spaces or special characters</li>
            <li>• Download our template for the correct format</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          {errors.length > 0 && (
            <button
              onClick={() => {
                const errorText = errors.join('\n');
                navigator.clipboard.writeText(errorText);
              }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Copy Errors
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportResults;
