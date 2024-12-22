type IncludeFunc = (query: string[], path: string, options: string) => boolean;
type TransformFunc = (
  data: DataRange,
  row: number,
  column: number,
  options: any,
) => void;

export type Cell = string | number | boolean | Date | null;

type Matrix<T = unknown> = T[][];

type Data = Matrix<Cell>;

export type DataRange = Data;

type State = { rowIndex: number };

/*====================================================================================================================================*
  ImportJSON by Brad Jasper and Trevor Lohrbeer
  ====================================================================================================================================
  Version:      1.5.0
  Project Page: https://github.com/bradjasper/ImportJSON
  Copyright:    (c) 2017-2019 by Brad Jasper
                (c) 2012-2017 by Trevor Lohrbeer
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  ------------------------------------------------------------------------------------------------------------------------------------
  A library for importing JSON feeds into Google spreadsheets. Functions include:

     ImportJSON            For use by end users to import a JSON feed from a URL 
     ImportJSONFromSheet   For use by end users to import JSON from one of the Sheets
     ImportJSONViaPost     For use by end users to import a JSON feed from a URL using POST parameters
     ImportJSONAdvanced    For use by script developers to easily extend the functionality of this library
     ImportJSONBasicAuth   For use by end users to import a JSON feed from a URL with HTTP Basic Auth (added by Karsten Lettow)

  For future enhancements see https://github.com/bradjasper/ImportJSON/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement
  
  For bug reports see https://github.com/bradjasper/ImportJSON/issues

/**
 * Imports a JSON feed and returns the results to be inserted into a Google Spreadsheet. The JSON feed is flattened to create
 * a two-dimensional array. The first row contains the headers, with each column header indicating the path to that data in
 * the JSON feed. The remaining rows contain the data.
 *
 * By default, data gets transformed so it looks more like a normal data import. Specifically:
 *
 *   - Data from parent JSON elements gets inherited to their child elements, so rows representing child elements contain the values
 *      of the rows representing their parent elements.
 *   - Values longer than 256 characters get truncated.
 *   - Headers have slashes converted to spaces, common prefixes removed and the resulting text converted to title case.
 *
 * To change this behavior, pass in one of these values in the options parameter:
 *
 *    noInherit:     Don't inherit values from parent elements
 *    noTruncate:    Don't truncate values
 *    rawHeaders:    Don't prettify headers
 *    noHeaders:     Don't include headers, only the data
 *    allHeaders:    Include all headers from the query parameter in the order they are listed
 *    debugLocation: Prepend each value with the row & column it belongs in
 *
 * For example:
 *
 *   =ImportJSON("http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&alt=json", "/feed/entry/title,/feed/entry/content",
 *               "noInherit,noTruncate,rawHeaders")
 *
 * @param {url}          the URL to a public JSON feed
 * @param {query}        a comma-separated list of paths to import. Any path starting with one of these paths gets imported.
 * @param {parseOptions} a comma-separated list of options that alter processing of the data
 * @customfunction
 *
 * @return a two-dimensional array containing the data, with the first row containing headers
 **/
export function ImportJSON(
  url: string,
  query: string | string[] = [],
  parseOptions: string,
) {
  return ImportJSONAdvanced(
    url,
    null,
    query,
    parseOptions,
    includeXPath_,
    defaultTransform_,
  );
}

function ImportJSONViaPost(
  url: string,
  payload: string,
  fetchOptions: string,
  query: string,
  parseOptions: string,
) {
  const postOptions = parseToObject_(fetchOptions);

  if (postOptions['method'] === null || postOptions['method'] === undefined) {
    postOptions['method'] = 'POST';
  }

  if (postOptions['payload'] === null || postOptions['payload'] === undefined) {
    postOptions['payload'] = payload;
  }

  if (
    postOptions['contentType'] === null ||
    postOptions['contentType'] == undefined
  ) {
    postOptions['contentType'] = 'application/x-www-form-urlencoded';
  }

  convertToBool_(postOptions, 'validateHttpsCertificates');
  convertToBool_(postOptions, 'useIntranet');
  convertToBool_(postOptions, 'followRedirects');
  convertToBool_(postOptions, 'muteHttpExceptions');

  return ImportJSONAdvanced(
    url,
    postOptions,
    query,
    parseOptions,
    includeXPath_,
    defaultTransform_,
  );
}

function ImportJSONAdvanced(
  url: string,
  fetchOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions | null,
  query: string | string[] = [],
  parseOptions: string,
  includeFunc: IncludeFunc,
  transformFunc: TransformFunc,
) {
  const jsondata = UrlFetchApp.fetch(url, fetchOptions || {});
  const object = JSON.parse(jsondata.getContentText());

  return parseJSONObject_(
    object,
    query,
    parseOptions,
    includeFunc,
    transformFunc,
  );
}

function ImportJSONBasicAuth(
  url: string,
  username: string,
  password: string,
  query: string | string[],
  parseOptions: string,
) {
  const encodedAuthInformation = Utilities.base64Encode(
    username + ':' + password,
  );
  const header = {
    headers: { Authorization: 'Basic ' + encodedAuthInformation },
  };
  return ImportJSONAdvanced(
    url,
    header,
    query,
    parseOptions,
    includeXPath_,
    defaultTransform_,
  );
}

function parseQueryOrOption_(query?: string | string[]): string[] {
  if (!query) {
    return [];
  }

  if (typeof query === 'string') {
    return query.split(',');
  }

  if (Array.isArray(query)) {
    return query;
  }

  return [];
}

/**
 * Parses a JSON object and returns a two-dimensional array containing the data of that object.
 */
function parseJSONObject_(
  object: Record<string, unknown>,
  query: string | string[],
  options: string | string[] = [],
  includeFunc: IncludeFunc,
  transformFunc: TransformFunc,
) {
  const headers: Record<string, number> = {};
  const data: Data = [];

  const queryArray = parseQueryOrOption_(query);
  const optionsArray = parseQueryOrOption_(options);

  if (hasOption_(options, 'allHeaders')) {
    for (let i = 0; i < queryArray.length; i++) {
      headers[queryArray[i]] = Object.keys(headers).length;
    }
  }

  parseData_(
    headers,
    data,
    '',
    { rowIndex: 1 },
    object,
    queryArray,
    optionsArray,
    includeFunc,
  );
  parseHeaders_(headers, data);
  transformData_(data, options, transformFunc);

  return hasOption_(options, 'noHeaders')
    ? data.length > 1
      ? data.slice(1)
      : []
    : data;
}

/**
 * Parses the data contained within the given value and inserts it into the data two-dimensional array starting at the rowIndex.
 * If the data is to be inserted into a new column, a new header is added to the headers array. The value can be an object,
 * array or scalar value.
 *
 * If the value is an object, it's properties are iterated through and passed back into this function with the name of each
 * property extending the path. For instance, if the object contains the property "entry" and the path passed in was "/feed",
 * this function is called with the value of the entry property and the path "/feed/entry".
 *
 * If the value is an array containing other arrays or objects, each element in the array is passed into this function with
 * the rowIndex incremeneted for each element.
 *
 * If the value is an array containing only scalar values, those values are joined together and inserted into the data array as
 * a single value.
 *
 * If the value is a scalar, the value is inserted directly into the data array.
 */
function parseData_(
  headers: Record<string, number>,
  data: Data,
  path: string,
  state: State,
  value: string | string[] | Record<string, unknown>,
  query: string[],
  options: string[],
  includeFunc?: IncludeFunc,
) {
  let dataInserted = false;

  if (isObjectArray_(value)) {
    for (let i = 0; i < value.length; i++) {
      if (
        parseData_(
          headers,
          data,
          path,
          state,
          value[i],
          query,
          options,
          includeFunc,
        )
      ) {
        dataInserted = true;

        if (data[state.rowIndex]) {
          state.rowIndex++;
        }
      }
    }
  } else if (isObject_(value)) {
    for (const key in value) {
      if (
        parseData_(
          headers,
          data,
          path + '/' + key,
          state,
          value[key] as string,
          query,
          options,
          includeFunc,
        )
      ) {
        dataInserted = true;
      }
    }
  } else if (
    !includeFunc ||
    includeFunc(query, path, options as unknown as string)
  ) {
    // Handle arrays containing only scalar values
    if (Array.isArray(value)) {
      value = value.join();
    }

    // Insert new row if one doesn't already exist
    if (!data[state.rowIndex]) {
      data[state.rowIndex] = [];
    }

    // Add a new header if one doesn't exist
    if (!headers[path] && headers[path] != 0) {
      headers[path] = Object.keys(headers).length;
    }

    // Insert the data
    data[state.rowIndex][headers[path]] = value;
    dataInserted = true;
  }

  return dataInserted;
}

/**
 * Parses the headers array and inserts it into the first row of the data array.
 */
function parseHeaders_(headers: Record<string, number>, data: Data) {
  data[0] = [];

  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      data[0][headers[key]] = key;
    }
  }
}

/**
 * Applies the transform function for each element in the data array, going through each column of each row.
 */
function transformData_(
  data: Data,
  options: string | string[],
  transformFunc: TransformFunc,
) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      transformFunc(data, i, j, options);
    }
  }
}

/**
 * Returns true if the given test value is an object; false otherwise.
 */
function isObject_(test: unknown): test is Record<string, unknown> {
  return Object.prototype.toString.call(test) === '[object Object]';
}

/**
 * Returns true if the given test value is an array containing at least one object; false otherwise.
 */
function isObjectArray_(test: unknown): test is Record<string, unknown>[] {
  if (!Array.isArray(test)) {
    return false; // Ensure 'test' is an array
  }

  return test.every((item) => isObject_(item));
}

/**
 * Returns true if the given query applies to the given path.
 */
function includeXPath_(
  query: string | string[],
  path: string,
  options: string,
) {
  if (!query) {
    return true;
  } else if (Array.isArray(query)) {
    for (let i = 0; i < query.length; i++) {
      if (applyXPathRule_(query[i], path, options)) {
        return true;
      }
    }
  } else {
    return applyXPathRule_(query, path, options);
  }

  return false;
}

/**
 * Returns true if the rule applies to the given path.
 */
function applyXPathRule_(rule: string, path: string, _options: string) {
  return path.indexOf(rule) == 0;
}

function isFirst_(indexOfLineOrColumn: number) {
  return indexOfLineOrColumn === 0;
}
/**
 * By default, this function transforms the value at the given row & column so it looks more like a normal data import. Specifically:
 *
 *   - Data from parent JSON elements gets inherited to their child elements, so rows representing child elements contain the values
 *     of the rows representing their parent elements.
 *   - Values longer than 256 characters get truncated.
 *   - Values in row 0 (headers) have slashes converted to spaces, common prefixes removed and the resulting text converted to title
 *      case.
 *
 * To change this behavior, pass in one of these values in the options parameter:
 *
 *    noInherit:     Don't inherit values from parent elements
 *    noTruncate:    Don't truncate values
 *    rawHeaders:    Don't prettify headers
 *    debugLocation: Prepend each value with the row & column it belongs in
 */
function defaultTransform_(
  data: Data,
  row: number,
  column: number,
  options: string,
) {
  if (data[row][column] === null) {
    data[row][column] =
      row < 2 || hasOption_(options, 'noInherit')
        ? ''
        : (data[row - 1][column] ?? '');
  }

  if (!hasOption_(options, 'rawHeaders') && isFirst_(row)) {
    if (isFirst_(column) && data[row].length > 1) {
      removeCommonPrefixes_(data, row);
    }

    data[row][column] = formatHeader_(data[row][column]);
  }

  if (!hasOption_(options, 'noTruncate') && data[row][column]) {
    data[row][column] = data[row][column].toString().slice(0, 256);
  }

  if (hasOption_(options, 'debugLocation')) {
    data[row][column] = `[${row},${column}]${data[row][column]}`;
  }
}

function formatHeader_(value: Cell) {
  if (value == null) {
    value = '';
  }
  return toTitleCase_(value.toString().replace(/[/_]/g, ' '));
}

/**
 * If all the values in the given row share the same prefix, remove that prefix.
 */
function removeCommonPrefixes_(data: Data, row: number): void {
  const rowData = data[row].map((value) => value?.toString() ?? ''); // Convert to strings and handle undefined/null
  if (rowData.length === 0) return; // Handle empty rows

  let matchIndex = rowData[0].length;

  // Determine the common prefix length
  for (let i = 1; i < rowData.length; i++) {
    const prevValue = rowData[i - 1] ?? '';
    const currentValue = rowData[i] ?? '';
    matchIndex = findEqualityEndpoint_(prevValue, currentValue, matchIndex);

    if (matchIndex === 0) return; // No common prefix
  }

  // Remove the common prefix from each value in the row
  for (let i = 0; i < rowData.length; i++) {
    rowData[i] = rowData[i].substring(matchIndex);
  }

  // Update the original data row
  data[row] = rowData;
}

/**
 * Locates the index where the two strings values stop being equal, stopping automatically at the stopAt index.
 */
function findEqualityEndpoint_(
  string1: string,
  string2: string,
  stopAt: number,
) {
  if (!string1 || !string2) {
    return -1;
  }

  const maxEndpoint = Math.min(stopAt, string1.length, string2.length);

  for (let i = 0; i < maxEndpoint; i++) {
    if (string1.charAt(i) != string2.charAt(i)) {
      return i;
    }
  }

  return maxEndpoint;
}

/**
 * Converts the text to title case.
 */
function toTitleCase_(text: string | null) {
  if (text == null) {
    return null;
  }

  return text.replace(/\w\S*/g, (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Returns true if the given set of options contains the given option.
 */
function hasOption_(options: string | string[], option: string): boolean {
  if (typeof options === 'string') {
    options = options.split(',');
  }

  return Array.isArray(options) && options.indexOf(option) >= 0;
}

/**
 * Parses the given string into an object, trimming any leading or trailing spaces from the keys.
 */
function parseToObject_(text: string | null): Record<string, unknown> {
  if (!text || !text.trim()) return {};

  return text.split(',').reduce((map: Record<string, unknown>, entry) => {
    const [key, ...valueParts] = entry.split('=');
    map[key.trim()] = valueParts.join('=') || '';
    return map;
  }, {});
}

/**
 * Returns the given value as a boolean.
 */
function toBool_(value: unknown) {
  return value == null
    ? false
    : value.toString().toLowerCase() == 'true'
      ? true
      : false;
}

/**
 * Converts the value for the given key in the given map to a bool.
 */
function convertToBool_(map: Record<string, unknown>, key: string) {
  if (map[key] != null) {
    map[key] = toBool_(map[key]);
  }
}
