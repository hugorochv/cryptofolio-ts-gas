/**
 * @OnlyCurrentDoc
 */

import { DataRange, ImportJSON } from './importjson';

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

export function safeGuardImportJSON(
  urls: string[] = [],
  sheetName = '',
  per_page = 250,
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet === null) {
    sheet = ss.insertSheet();
  }

  let counting_success = 0;

  urls.forEach(function (url, i) {
    let status = false;
    let counting = 0;

    while (!status && counting < 3) {
      try {
        let dataAll = ImportJSON(url, undefined, 'noTruncate');
        console.log(url);

        if (!('error' in dataAll)) {
          // console.log(dataAll);

          status = true;
          counting_success += 1;

          const schema = [
            'Id',
            'Symbol',
            'Name',
            'Image',
            'Current Price',
            'Market Cap',
            'Market Cap Rank',
            'Fully Diluted Valuation',
            'Total Volume',
            'High 24h',
            'Low 24h',
            'Price Change 24h',
            'Price Change Percentage 24h',
            'Market Cap Change 24h',
            'Market Cap Change Percentage 24h',
            'Circulating Supply',
            'Total Supply',
            'Max Supply',
            'Ath',
            'Ath Change Percentage',
            'Ath Date',
            'Atl',
            'Atl Change Percentage',
            'Atl Date',
            'Roi',
            'Last Updated',
            'Price Change Percentage 1h In Currency',
            'Price Change Percentage 24h In Currency',
            'Price Change Percentage 30d In Currency',
            'Price Change Percentage 7d In Currency',
            'Roi Times',
            'Roi Currency',
            'Roi Percentage',
          ];

          const header = dataAll[0];

          console.log(dataAll);

          if (JSON.stringify(schema) != JSON.stringify(header)) {
            const sortarray = header.map((h) => schema.indexOf(h as any));
            dataAll = dataAll.map(function (row) {
              return sortarray.map((index) => row[index]);
            });
          }
          if (i > 0) {
            dataAll = dataAll.slice(1);
          }

          sheet
            .getRange(
              1 + i * per_page + (i > 0 ? 1 : 0),
              1,
              dataAll.length,
              dataAll[0].length,
            )
            .setValues(dataAll);
        }
        break;
      } catch (e: any) {
        console.log(e);
      }

      counting++;
      Utilities.sleep(1500);
    }
  });
  return counting_success;
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
