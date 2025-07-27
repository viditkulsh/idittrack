import { useState } from 'react';
import { 
  processProductsCSV, 
  processInventoryCSV, 
  processOrdersCSV, 
  detectCSVType,
  CSVProcessingResult 
} from '../utils/csvProcessor';

export interface CSVImportState {
  isProcessing: boolean;
  result: CSVProcessingResult | null;
  error: string | null;
}

export const useCSVImport = () => {
  const [importState, setImportState] = useState<CSVImportState>({
    isProcessing: false,
    result: null,
    error: null
  });

  const processCSVFile = async (file: File, userId: string): Promise<CSVProcessingResult> => {
    setImportState({
      isProcessing: true,
      result: null,
      error: null
    });

    try {
      // Read file content
      const csvContent = await readFileAsText(file);
      
      // Detect CSV type
      const csvType = detectCSVType(csvContent);
      
      if (csvType === 'unknown') {
        throw new Error('Unable to detect CSV format. Please ensure your CSV has the correct headers.');
      }

      let result: CSVProcessingResult;

      // Process based on detected type
      switch (csvType) {
        case 'products':
          result = await processProductsCSV(csvContent);
          break;
        case 'inventory':
          result = await processInventoryCSV(csvContent);
          break;
        case 'orders':
          result = await processOrdersCSV(csvContent, userId);
          break;
        default:
          throw new Error('Unsupported CSV format');
      }

      setImportState({
        isProcessing: false,
        result,
        error: null
      });

      return result;

    } catch (error: any) {
      const errorResult: CSVProcessingResult = {
        success: false,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [error.message]
      };

      setImportState({
        isProcessing: false,
        result: errorResult,
        error: error.message
      });

      return errorResult;
    }
  };

  const resetImportState = () => {
    setImportState({
      isProcessing: false,
      result: null,
      error: null
    });
  };

  return {
    importState,
    processCSVFile,
    resetImportState
  };
};

// Helper function to read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}
