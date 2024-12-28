/**
 * @OnlyCurrentDoc
 */

import { DEFAULT_ORDERED_SCHEMA } from './constants';
import { Cell, DataRange, ImportJSON } from './importjson';

export function sortBy(arr: any[], key: string, desc = true) {
  return desc
    ? arr.sort((a, b) => b[key] - a[key])
    : arr.sort((a, b) => a[key] - b[key]);
}

function getCurrencyFormat(currencyCode: string) {
  const defaultFormat = '#,##0.00';
  const currencyFormat: Record<string, string> = {
    USD: '[$$]#,##0.00',
    CAD: '[$$]#,##0.00',
    GBP: '[$£]#,##0.00',
    EUR: '[$€]#,##0.00',
  };

  return currencyFormat[currencyCode] || defaultFormat;
}

export function updateCurrencyFormat() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shMarket = ss.getSheetByName('Market (Mk)');
  const shHistory = ss.getSheetByName('db_history');
  const shRowTemplate = ss.getSheetByName('--do not remove--');
  const uiCurrency = ss.getRange('fiat_currency').getValue();

  const selFormat = getCurrencyFormat(uiCurrency);

  const colsSettings = [5, 9, 10, 12, 13, 16, 18, 22, 24];

  if (!shMarket || !shHistory || !shRowTemplate) return;

  // update Market Sheet: Total Header
  ss.getRangeByName('portfolio_growth')?.setNumberFormat(selFormat);

  // update Market Sheet: Crypto Table
  const numRows = ss.getRangeByName('portfolio_detail')?.getNumRows();
  if (!numRows) return;

  const a1Range_settings = colsSettings
    .map((colId) =>
      ss
        .getRangeByName('portfolio_detail')
        ?.offset(0, colId, numRows, 1)
        ?.getA1Notation(),
    )
    .filter((range): range is string => range !== undefined);

  if (!a1Range_settings) return;

  shMarket.getRangeList(a1Range_settings).setNumberFormat(selFormat);

  // update Row Template Sheet
  const nbRowsTemplateRowCrypto = ss
    .getRangeByName('template_row_crypto')
    ?.getNumRows();
  if (!nbRowsTemplateRowCrypto) return;

  const a1Range_settings2 = colsSettings
    .map((colId) =>
      ss
        .getRangeByName('template_row_crypto')
        ?.offset(0, colId, nbRowsTemplateRowCrypto, 1)
        ?.getA1Notation(),
    )
    .filter((range): range is string => !!range);
  shRowTemplate.getRangeList(a1Range_settings2).setNumberFormat(selFormat);

  const rangeDbHistory = ss.getRangeByName('db_history');
  if (!rangeDbHistory) return;

  // update db_history Sheet
  const dbHistoryNumRows = rangeDbHistory.getNumRows();
  const a1RangeSettingsDbHistory = [2, 3, 5, 6]
    .map((nCol) =>
      rangeDbHistory.offset(0, nCol, dbHistoryNumRows, 1).getA1Notation(),
    )
    .filter((range): range is string => range !== undefined);
  shHistory.getRangeList(a1RangeSettingsDbHistory).setNumberFormat(selFormat);
}

type FormatOptions = {
  includePlusSign?: boolean;
  isPercentage?: boolean;
  decimalPlaces?: number;
  suffix?: string;
};

export function formatNumber(
  input: string | number,
  options: FormatOptions = {},
): string {
  const {
    includePlusSign = true,
    isPercentage = false,
    decimalPlaces = 2,
    suffix = '',
  } = options;

  let numericValue = typeof input === 'number' ? input : parseFloat(input);

  if (isPercentage) {
    numericValue *= 100;
  }

  const roundedValue = numericValue.toFixed(decimalPlaces);
  const localizedValue = parseFloat(roundedValue).toLocaleString('fr');

  if (includePlusSign && numericValue > 0) {
    return `+${localizedValue}${suffix}`;
  }

  return localizedValue + suffix;
}

function getOrCreateSheet(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  sheetName: string,
) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

function fetchJSONData(url: string) {
  console.log('fetching data from URL:', url);
  const data = ImportJSON(url, undefined, 'noTruncate,rawHeaders');
  if (data && !(data as unknown as any).error) {
    return data;
  }

  console.error((data as unknown as any)?.error);
  return null;
}

function processJSONData(data: DataRange, fetchId: number) {
  const [headers] = data;

  if (!areHeadersValid(headers)) {
    data = reorderColumns(data, headers);
  } else {
    console.log('valid headers received', { headers });
  }

  // Skip the header for all but the first GET
  return fetchId > 0 ? data.slice(1) : data;
}

function areHeadersValid(header: Cell[]) {
  return JSON.stringify(header) === JSON.stringify(DEFAULT_ORDERED_SCHEMA);
}

// todo: renaming column headers would have more sense
function reorderColumns(data: DataRange, headers: Cell[]): DataRange {
  const headerIndexMap = headers.reduce(
    (map, header, index) => {
      const targetIndex = DEFAULT_ORDERED_SCHEMA.indexOf(header as string);
      if (targetIndex !== -1) {
        map[index] = targetIndex;
      } else {
        console.error('Unknown column:', header);
        map[index] = -1;
      }
      return map;
    },
    {} as Record<number, number>,
  );

  const reorderedData: DataRange = data.map((row) => {
    const reorderedRow: Cell[] = Array(DEFAULT_ORDERED_SCHEMA.length).fill(
      'invalid_state',
    );

    for (const [currentIndex, targetIndex] of Object.entries(headerIndexMap)) {
      const currentIdx = parseInt(currentIndex, 10);
      if (targetIndex !== -1) {
        reorderedRow[targetIndex] = row[currentIdx];
      }
    }
    return reorderedRow;
  });

  return reorderedData;
}

function writeDataToSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  data: DataRange,
  index: number,
  rowsPerPage: number,
) {
  const startRow = 1 + index * rowsPerPage + (index > 0 ? 1 : 0);
  console.log('trying to write data to sheet:', {
    startRow,
    nbRow: data.length,
    nbColumn: data[0].length,
  });
  const range = sheet.getRange(startRow, 1, data.length, data[0].length);
  range.setValues(data);
}

// todo: switch to 3 retries
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1500;

function importDataWithRetries(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  url: string,
  index: number,
  rowsPerPage: number,
) {
  const attemptImport = (attempt: number) => {
    if (attempt >= MAX_RETRIES) return false;

    try {
      const rawData = fetchJSONData(url);
      if (!rawData) {
        console.error(`Failed to fetch valid data from URL: ${url}`);
        return false;
      }

      const data = processJSONData(rawData, index);
      writeDataToSheet(sheet, data, index, rowsPerPage);
      return true;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for URL: ${url}`, error);
      Utilities.sleep(RETRY_DELAY_MS);
      return attemptImport(attempt + 1);
    }
  };

  return attemptImport(0);
}

export function safeGuardImportJSON(
  urls: string[] = [],
  sheetName = '',
  rowsPerPage = 250,
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, sheetName);

  let successfulImports = 0;

  urls.forEach((url, index) => {
    if (importDataWithRetries(sheet, url, index, rowsPerPage)) {
      successfulImports++;
      return;
    }
    console.error(`Failed to import data from URL: ${url}`);
  });

  return successfulImports;
}

function getLocalNow(
  tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone(),
  format = 'dd/MM/yyyy',
) {
  return Utilities.formatDate(new Date(), tz, format);
}

export function prepareDataRange(
  sourceRangeName: string,
  selectCols: number[] = [],
): DataRange {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sourceRange = ss.getRangeByName(sourceRangeName)?.getValues();
  if (!sourceRange) return [[]];

  sourceRange = filterRows(sourceRange);
  sourceRange = filterColumns(sourceRange, selectCols);

  sourceRange.forEach((i) => {
    i.unshift(getLocalNow());
    i.push(getLocalNow(undefined, 'yyyy-MM-dd HH:mm:ssZ'));
  });

  return sourceRange;

  function filterRows(range: DataRange, keep_headers = false) {
    const _r = range.filter((row) => row.join('').length !== 0);

    if (keep_headers) {
      return _r;
    }

    return _r.slice(1);
  }

  function filterColumns(range: DataRange, columnIds: number[]) {
    if (columnIds.length === 0) return range;

    const totalColumns = range[0].length;
    const validColumnIds = columnIds.filter((id) => id < totalColumns);

    return range.map((row) => validColumnIds.map((colId) => row[colId]));
  }
}

export function storeRows2Sheet(
  sourceRange: DataRange,
  targetSheetName: string,
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheet = ss.getSheetByName(targetSheetName);

  if (targetSheet) {
    sourceRange.forEach((row) => targetSheet.appendRow(row));
  }

  return sourceRange;
}
