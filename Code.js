function getDLCrypto() {
}
function getTemplatePayload() {
}
function postMessageToDiscord() {
}
function dailyAlertTrigger() {
}
function storeRows2SheetTrigger() {
}
function cgDataManualRefresh() {
}
function testDiscord() {
}
function cgDataRefresh() {
}
function onEdit() {
}
function onOpen() {
}
function createTriggers() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/constants.js":
/*!***************************!*\
  !*** ./dist/constants.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_ORDERED_SCHEMA: () => (/* binding */ DEFAULT_ORDERED_SCHEMA)
/* harmony export */ });
const DEFAULT_ORDERED_SCHEMA = [
    '/id',
    '/symbol',
    '/name',
    '/image',
    '/currentPrice',
    '/marketCap',
    '/marketCapRank',
    '/fullyDilutedValuation',
    '/totalVolume',
    '/high24h',
    '/low24h',
    '/marketCapChange24h',
    '/marketCapChangePercentage24h',
    '/priceChange24h',
    '/circulatingSupply',
    '/totalSupply',
    '/maxSupply',
    '/ath',
    '/athChangePercentage',
    '/athDate',
    '/atl',
    '/atlChangePercentage',
    '/atlDate',
    '/priceChangePercentage1h',
    '/priceChangePercentage24h',
    '/priceChangePercentage7d',
    '/priceChangePercentage30d',
    '/priceChangePercentage1y',
    '/lastUpdated',
];


/***/ }),

/***/ "./dist/discord.js":
/*!*************************!*\
  !*** ./dist/discord.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDLCrypto: () => (/* binding */ getDLCrypto),
/* harmony export */   getTemplatePayload: () => (/* binding */ getTemplatePayload),
/* harmony export */   postMessageToDiscord: () => (/* binding */ postMessageToDiscord)
/* harmony export */ });
/* harmony import */ var _discordTMPL_dailyGlobal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./discordTMPL_dailyGlobal */ "./dist/discordTMPL_dailyGlobal.js");
/* harmony import */ var _discordTMPL_dailyMarket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./discordTMPL_dailyMarket */ "./dist/discordTMPL_dailyMarket.js");
/* harmony import */ var _discordTMPL_dailyPortfolio__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./discordTMPL_dailyPortfolio */ "./dist/discordTMPL_dailyPortfolio.js");



function postMessageToDiscord(webhook = '', customPayload = {}) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const gSheet_url = ss.getUrl();
    const payloadDefault = {
        avatar_url: 'https://lh3.googleusercontent.com/yCF7mTvXRF_EhDf7Kun5_-LMYTbD2IL-stx_D97EzpACfhpGjY_Frx8NZw63rSn2dME0v8-Im49Mh16htvPAGmEOMhiTxDZzo6rB7MY',
    };
    const payload = { ...payloadDefault, ...customPayload };
    if (!webhook) {
        webhook = ss.getRangeByName('discord_webhook')?.getValue();
        if (!/^https?:\/\/[a-z]*/.test(webhook)) {
            Logger.log(`sending notification canceled - no valid webhook url`);
            return 'ERROR_NO_VALID_WEBHOOK';
        }
    }
    if (Object.keys(payload).length === 1) {
        payload.embeds = [
            {
                title: 'Bip! Bip! This is a test',
                description: `This notification has been triggered by :  ${gSheet_url}`,
            },
        ];
    }
    console.log(payload);
    const params = {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
    };
    try {
        const response = UrlFetchApp.fetch(webhook, params);
        Logger.log(`notification sent to ${webhook}`);
        Logger.log(response);
        if ('message' in response) {
            Logger.log(response);
            return 'ERROR_INVALID_MESSAGE';
        }
        return 'SUCCESS';
    }
    catch (e) {
        const message = `error sending notification to ${webhook}: ${e}`;
        Logger.log(message);
        return 'ERROR_UNKNOWN';
    }
}
function getTemplatePayload(dl, templateName) {
    let payload;
    switch (templateName) {
        case 'daily_global':
            payload = (0,_discordTMPL_dailyGlobal__WEBPACK_IMPORTED_MODULE_0__.discordTMPL_dailyGlobal)(dl);
            break;
        case 'daily_market':
            payload = (0,_discordTMPL_dailyMarket__WEBPACK_IMPORTED_MODULE_1__.discordTMPL_dailyMarket)(dl);
            break;
        case 'daily_portfolio':
            payload = (0,_discordTMPL_dailyPortfolio__WEBPACK_IMPORTED_MODULE_2__.discordTMPL_dailyPortfolio)(dl);
            break;
        default:
            return;
    }
    return payload;
}
function getDLCrypto(rawDL) {
    return rawDL
        .map((crypto) => ({
        name: crypto[2],
        ticker: crypto[3],
        current_val: crypto[13],
        price: crypto[9],
        low: crypto[23],
        high: crypto[25],
        change1h: crypto[4],
        change24h: crypto[7],
        change7d: crypto[8],
        change30d: crypto[9],
        deposit: crypto[10],
        roi: crypto[17],
        roi_change: crypto[18],
        url: `https://www.coingecko.com/en/coins/${crypto[2]?.toLowerCase()}`,
    }))
        .filter((crypto) => crypto.name !== '--not sync--')
        .map((crypto) => ({
        ...crypto,
        markdown_link: `[${crypto.ticker}](${crypto.url})`,
    }));
}


/***/ }),

/***/ "./dist/discordTMPL_dailyGlobal.js":
/*!*****************************************!*\
  !*** ./dist/discordTMPL_dailyGlobal.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   discordTMPL_dailyGlobal: () => (/* binding */ discordTMPL_dailyGlobal)
/* harmony export */ });
function discordTMPL_dailyGlobal(dl) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const [unembeddedDl] = dl;
    function stringifyNumber(value, usePrefix = false) {
        const parsedValue = parseFloat(value);
        let out = '';
        if (parsedValue && usePrefix) {
            out = '+';
        }
        out += parseFloat(value).toLocaleString('fr');
        return out;
    }
    const datalayer = {
        date: unembeddedDl[0],
        url: ss.getUrl(),
        kpi_24h_change: (unembeddedDl[1] * 100).toFixed(2) || '',
        kpi_24h_amount: unembeddedDl[2].toFixed(2) || '',
        kpi_24h_delta: unembeddedDl[11].toFixed(2) || '',
        kpi_top500_1h_change: (unembeddedDl[10] * 100).toFixed(2) || '',
        kpi_top500_24h_change: (unembeddedDl[9] * 100).toFixed(2) || '',
        kpi_top500_7d_change: (unembeddedDl[8] * 100).toFixed(2) || '',
        kpi_top500_30d_change: (unembeddedDl[7] * 100).toFixed(2) || '',
        kpi_net_worth: unembeddedDl[6].toFixed(2) || '',
        kpi_deposit: unembeddedDl[5].toFixed(2) || '',
        display_currency: 'CAD',
        kpi_roi: unembeddedDl[3].toFixed(2) || '',
        kpi_roi_change: (unembeddedDl[4] * 100).toFixed(2) || '',
    };
    const increaseTrend = !!(parseFloat(datalayer['kpi_24h_change']) > 0);
    const payload = {
        embeds: [
            {
                color: increaseTrend ? 0x0099ff : 0xf08d49,
                title: `**${datalayer['date']}** - Global Daily Reporting (**${stringifyNumber(datalayer['kpi_24h_change'])}%**)`,
                url: datalayer['url'],
                timestamp: new Date(),
                description: `${increaseTrend ? 'Great, your portfolio has gained' : 'Ouch, your portfolio lost'} **${parseFloat(datalayer['kpi_24h_amount']).toLocaleString('fr')} ${datalayer['display_currency']}** in the last 24h. Here is a quick overview of your actual performances:`,
                fields: [
                    {
                        name: `Currency`,
                        value: datalayer['display_currency'],
                        inline: true,
                    },
                    {
                        name: `Investment`,
                        value: stringifyNumber(datalayer['kpi_deposit']),
                        inline: true,
                    },
                    {
                        name: `Net Worth`,
                        value: stringifyNumber(datalayer['kpi_net_worth']),
                        inline: true,
                    },
                    {
                        name: `Market Delta (Δ)`,
                        value: stringifyNumber(datalayer['kpi_24h_delta']),
                        inline: true,
                    },
                    {
                        name: `Gains/Loss`,
                        value: stringifyNumber(datalayer['kpi_roi']),
                        inline: true,
                    },
                    {
                        name: 'ROI %',
                        value: `${stringifyNumber(datalayer['kpi_roi_change'])}%`,
                        inline: true,
                    },
                    {
                        name: '24H %',
                        value: `${stringifyNumber(datalayer['kpi_top500_24h_change'])}%`,
                        inline: true,
                    },
                    {
                        name: '7D %',
                        value: `${stringifyNumber(datalayer['kpi_top500_7d_change'])}%`,
                        inline: true,
                    },
                    {
                        name: '30D %',
                        value: `${stringifyNumber(datalayer['kpi_top500_30d_change'])}%`,
                        inline: true,
                    },
                ],
                footer: {
                    text: `DAILY REPORTING | Cryptofolio G. Sheet | data from Coingecko API`,
                },
            },
        ],
    };
    return payload;
}


/***/ }),

/***/ "./dist/discordTMPL_dailyMarket.js":
/*!*****************************************!*\
  !*** ./dist/discordTMPL_dailyMarket.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   discordTMPL_dailyMarket: () => (/* binding */ discordTMPL_dailyMarket)
/* harmony export */ });
function discordTMPL_dailyMarket(dl) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const nb_crypto1h = dl.filter((i) => i.change1h > 0).length;
    const nb_crypto24h = dl.filter((i) => i.change24h > 0).length;
    const nb_crypto7d = dl.filter((i) => i.change7d > 0).length;
    const nb_crypto30d = dl.filter((i) => i.change30d > 0).length;
    const nb_crypto = dl.length;
    const rate_crypto1h = Math.round((nb_crypto1h / nb_crypto) * 5);
    const rate_crypto24h = Math.round((nb_crypto24h / nb_crypto) * 5);
    const rate_crypto7d = Math.round((nb_crypto7d / nb_crypto) * 5);
    const rate_crypto30d = Math.round((nb_crypto30d / nb_crypto) * 5);
    const payload = {
        embeds: [
            {
                title: 'MARKET OVERVIEW',
                url: ss.getUrl(),
                timestamp: new Date(),
                description: '',
                fields: [
                    {
                        name: `# Positive Change Last 1h`,
                        value: `**${nb_crypto1h}**/${nb_crypto}\n${':blue_circle:'.repeat(rate_crypto1h) + ':black_circle:'.repeat(5 - rate_crypto1h)}`,
                        inline: true,
                    },
                    {
                        name: `# Positive Change Last 24h`,
                        value: `**${nb_crypto24h}**/${nb_crypto}\n${':blue_circle:'.repeat(rate_crypto24h) + ':black_circle:'.repeat(5 - rate_crypto24h)}`,
                        inline: true,
                    },
                    {
                        name: `# Positive Change Last 7D`,
                        value: `**${nb_crypto7d}**/${nb_crypto}\n${':blue_circle:'.repeat(rate_crypto7d) + ':black_circle:'.repeat(5 - rate_crypto7d)}`,
                        inline: true,
                    },
                    {
                        name: `# Positive Change Last 30D`,
                        value: `**${nb_crypto30d}**/${nb_crypto}\n${':blue_circle:'.repeat(rate_crypto30d) + ':black_circle:'.repeat(5 - rate_crypto30d)}`,
                        inline: true,
                    },
                ],
                footer: {
                    text: `DAILY REPORTING | Cryptofolio G. Sheet | data from Coingecko API`,
                },
            },
        ],
    };
    return payload;
}


/***/ }),

/***/ "./dist/discordTMPL_dailyPortfolio.js":
/*!********************************************!*\
  !*** ./dist/discordTMPL_dailyPortfolio.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   discordTMPL_dailyPortfolio: () => (/* binding */ discordTMPL_dailyPortfolio)
/* harmony export */ });
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib */ "./dist/lib.js");

// todo complete this function
function formatList(items, icon, highlightIcon, formatter) {
    return items
        .map((item, i) => {
        const stars = highlightIcon.repeat(5 - i);
        const circles = icon.repeat(i);
        return `- ${circles}${stars} ${formatter(item)}`;
    })
        .join('\n');
}
function discordTMPL_dailyPortfolio(dl) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const top5_assets = (0,_lib__WEBPACK_IMPORTED_MODULE_0__.sortBy)(dl, 'current_val').slice(0, 5);
    const top5_gains = (0,_lib__WEBPACK_IMPORTED_MODULE_0__.sortBy)(dl, 'roi_change').slice(0, 5);
    const top5_loss = (0,_lib__WEBPACK_IMPORTED_MODULE_0__.sortBy)(dl, 'roi_change', false).slice(0, 5);
    const top5_24hchange = (0,_lib__WEBPACK_IMPORTED_MODULE_0__.sortBy)(dl, 'change24h').slice(0, 5);
    const last5_24hchange = (0,_lib__WEBPACK_IMPORTED_MODULE_0__.sortBy)(dl, 'change24h', false).slice(0, 5);
    const payload = {
        embeds: [
            {
                title: 'PORTFOLIO OVERVIEW',
                url: ss.getUrl(),
                timestamp: new Date(),
                description: '',
                fields: [
                    {
                        name: `:trophy: Top5 Biggest Assets :trophy:`,
                        value: top5_assets
                            .map(({ markdown_link, roi }, i) => `- ${':black_circle:'.repeat(i)}${':star:'.repeat(5 - i)} ${markdown_link} **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(roi, { suffix: '$' })}** (${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(roi, { includePlusSign: true, suffix: '$' })})`)
                            .join('\n'),
                        inline: false,
                    },
                    {
                        name: `:trophy: Top5 GAINS :trophy:`,
                        value: top5_gains
                            .map(({ markdown_link, roi, roi_change }, i) => `- ${':black_circle:'.repeat(Math.round(i / 2))}${':star:'.repeat(Math.round((5 - i) / 2))} ${markdown_link} **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(roi, { suffix: '$' })}** (${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(roi_change, { isPercentage: true, decimalPlaces: 0, suffix: '%' })})`)
                            .join('\n'),
                        inline: true,
                    },
                    {
                        name: `:skull: Top5 LOSSES :skull:`,
                        value: top5_loss
                            .map(({ markdown_link, roi, roi_change }, i) => `- ${':black_circle:'.repeat(Math.round(i / 2))}${':ghost:'.repeat(Math.round((5 - i) / 2))} ${markdown_link} **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(roi, { suffix: '$' })}** (${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(roi_change, { isPercentage: true, decimalPlaces: 0, suffix: '%' })})`)
                            .join('\n'),
                        inline: true,
                    },
                    {
                        name: `:trophy: Top5 CHANGE 24H :trophy:`,
                        value: top5_24hchange
                            .map(({ change24h, markdown_link, low, price, high }, i) => `- ${':black_circle:'.repeat(i)}${':star:'.repeat(5 - i)} ${markdown_link} **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(change24h, { isPercentage: true, suffix: '%' })}** (low = ${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(low, { includePlusSign: false, suffix: '$' })} > **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(price, { includePlusSign: false, suffix: '$' })}** > max = ${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(high, { includePlusSign: false, suffix: '$' })})`)
                            .join('\n'),
                        inline: false,
                    },
                    {
                        name: `:skull: Last5 CHANGE 24H :skull:`,
                        value: last5_24hchange
                            .map(({ markdown_link, change24h, low, high, price }, i) => `- ${':black_circle:'.repeat(i)}${':ghost:'.repeat(5 - i)} ${markdown_link} **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(change24h, { isPercentage: true, suffix: '%' })}** (low = ${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(low, { includePlusSign: false, suffix: '$' })} > **${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(price, { includePlusSign: false, suffix: '$' })}** > max = ${(0,_lib__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(high, { includePlusSign: false, suffix: '$' })})`)
                            .join('\n'),
                        inline: false,
                    },
                ],
                footer: {
                    text: `DAILY REPORTING | Cryptofolio G. Sheet | data from Coingecko API`,
                },
            },
        ],
    };
    return payload;
}


/***/ }),

/***/ "./dist/importjson.js":
/*!****************************!*\
  !*** ./dist/importjson.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImportJSON: () => (/* binding */ ImportJSON)
/* harmony export */ });
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
function ImportJSON(url, query = '', parseOptions) {
    return ImportJSONAdvanced(url, undefined, query, parseOptions, includeXPath_, defaultTransform_);
}
function ImportJSONAdvanced(url, fetchOptions = {}, query = [], parseOptions, includeFunc, transformFunc) {
    const jsondata = UrlFetchApp.fetch(url, fetchOptions);
    const object = JSON.parse(jsondata.getContentText());
    return parseJSONObject_(object, query, parseOptions, includeFunc, transformFunc);
}
// function ImportJSONBasicAuth(
//   url: string,
//   username: string,
//   password: string,
//   query: string | string[],
//   parseOptions: string,
// ) {
//   const encodedAuthInformation = Utilities.base64Encode(
//     username + ':' + password,
//   );
//   const header = {
//     headers: { Authorization: 'Basic ' + encodedAuthInformation },
//   };
//   return ImportJSONAdvanced(
//     url,
//     header,
//     query,
//     parseOptions,
//     includeXPath_,
//     defaultTransform_,
//   );
// }
function parseQueryOrOption_(query) {
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
function parseJSONObject_(object, query, options = [], includeFunc, transformFunc) {
    const headers = {};
    const data = [];
    const queryArray = parseQueryOrOption_(query);
    const optionsArray = parseQueryOrOption_(options);
    if (hasOption_(options, 'allHeaders')) {
        for (let i = 0; i < queryArray.length; i++) {
            headers[queryArray[i]] = Object.keys(headers).length;
        }
    }
    parseData_(headers, data, '', { rowIndex: 1 }, object, queryArray, optionsArray, includeFunc);
    console.log('data fetched successfully', { headers, rows: data.length });
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
function parseData_(headers, data, path, state, value, query, options, includeFunc) {
    let dataInserted = false;
    if (isObjectArray_(value)) {
        for (let i = 0; i < value.length; i++) {
            if (parseData_(headers, data, path, state, value[i], query, options, includeFunc)) {
                dataInserted = true;
                if (data[state.rowIndex]) {
                    state.rowIndex++;
                }
            }
        }
    }
    else if (isObject_(value)) {
        for (const key in value) {
            if (parseData_(headers, data, path + '/' + key, state, value[key], query, options, includeFunc)) {
                dataInserted = true;
            }
        }
    }
    else if (!includeFunc ||
        includeFunc(query, path, options)) {
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
function parseHeaders_(headers, data) {
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
function transformData_(data, options, transformFunc) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[0].length; j++) {
            transformFunc(data, i, j, options);
        }
    }
}
/**
 * Returns true if the given test value is an object; false otherwise.
 */
function isObject_(test) {
    return Object.prototype.toString.call(test) === '[object Object]';
}
/**
 * Returns true if the given test value is an array containing at least one object; false otherwise.
 */
function isObjectArray_(test) {
    if (!Array.isArray(test)) {
        return false; // Ensure 'test' is an array
    }
    return test.every((item) => isObject_(item));
}
/**
 * Returns true if the given query applies to the given path.
 */
function includeXPath_(query, path, options) {
    if (!query || query.length == 0) {
        return true;
    }
    else if (Array.isArray(query)) {
        for (let i = 0; i < query.length; i++) {
            if (applyXPathRule_(query[i], path, options)) {
                return true;
            }
        }
    }
    else {
        return applyXPathRule_(query, path, options);
    }
    return false;
}
/**
 * Returns true if the rule applies to the given path.
 */
function applyXPathRule_(rule, path, _options) {
    return path.indexOf(rule) == 0;
}
function isFirst_(indexOfLineOrColumn) {
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
function defaultTransform_(data, row, column, options) {
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
function formatHeader_(value) {
    if (value == null) {
        value = '';
    }
    return toTitleCase_(value.toString().replace(/[/_]/g, ' '));
}
/**
 * If all the values in the given row share the same prefix, remove that prefix.
 */
function removeCommonPrefixes_(data, row) {
    const rowData = data[row].map((value) => value?.toString() ?? ''); // Convert to strings and handle undefined/null
    if (rowData.length === 0)
        return; // Handle empty rows
    let matchIndex = rowData[0].length;
    // Determine the common prefix length
    for (let i = 1; i < rowData.length; i++) {
        const prevValue = rowData[i - 1] ?? '';
        const currentValue = rowData[i] ?? '';
        matchIndex = findEqualityEndpoint_(prevValue, currentValue, matchIndex);
        if (matchIndex === 0)
            return; // No common prefix
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
function findEqualityEndpoint_(string1, string2, stopAt) {
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
function toTitleCase_(text) {
    if (text == null) {
        return null;
    }
    return text.replace(/\w\S*/g, (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}
/**
 * Returns true if the given set of options contains the given option.
 */
function hasOption_(options, option) {
    if (typeof options === 'string') {
        options = options.split(',');
    }
    return Array.isArray(options) && options.indexOf(option) >= 0;
}
/**
 * Parses the given string into an object, trimming any leading or trailing spaces from the keys.
 */
function parseToObject_(text) {
    if (!text || !text.trim())
        return {};
    return text.split(',').reduce((map, entry) => {
        const [key, ...valueParts] = entry.split('=');
        map[key.trim()] = valueParts.join('=') || '';
        return map;
    }, {});
}
/**
 * Returns the given value as a boolean.
 */
function toBool_(value) {
    return value == null
        ? false
        : value.toString().toLowerCase() == 'true'
            ? true
            : false;
}
/**
 * Converts the value for the given key in the given map to a bool.
 */
function convertToBool_(map, key) {
    if (map[key] != null) {
        map[key] = toBool_(map[key]);
    }
}


/***/ }),

/***/ "./dist/lib.js":
/*!*********************!*\
  !*** ./dist/lib.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatNumber: () => (/* binding */ formatNumber),
/* harmony export */   prepareDataRange: () => (/* binding */ prepareDataRange),
/* harmony export */   safeGuardImportJSON: () => (/* binding */ safeGuardImportJSON),
/* harmony export */   sortBy: () => (/* binding */ sortBy),
/* harmony export */   storeRows2Sheet: () => (/* binding */ storeRows2Sheet),
/* harmony export */   updateCurrencyFormat: () => (/* binding */ updateCurrencyFormat)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./dist/constants.js");
/* harmony import */ var _importjson__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./importjson */ "./dist/importjson.js");
/**
 * @OnlyCurrentDoc
 */


function sortBy(arr, key, desc = true) {
    return desc
        ? arr.sort((a, b) => b[key] - a[key])
        : arr.sort((a, b) => a[key] - b[key]);
}
function getCurrencyFormat(currencyCode) {
    const defaultFormat = '#,##0.00';
    const currencyFormat = {
        USD: '[$$]#,##0.00',
        CAD: '[$$]#,##0.00',
        GBP: '[$£]#,##0.00',
        EUR: '[$€]#,##0.00',
    };
    return currencyFormat[currencyCode] || defaultFormat;
}
function updateCurrencyFormat() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shMarket = ss.getSheetByName('Market (Mk)');
    const shHistory = ss.getSheetByName('db_history');
    const shRowTemplate = ss.getSheetByName('--do not remove--');
    const uiCurrency = ss.getRange('fiat_currency').getValue();
    const selFormat = getCurrencyFormat(uiCurrency);
    const colsSettings = [5, 9, 10, 12, 13, 16, 18, 22, 24];
    if (!shMarket || !shHistory || !shRowTemplate)
        return;
    // update Market Sheet: Total Header
    ss.getRangeByName('portfolio_growth')?.setNumberFormat(selFormat);
    // update Market Sheet: Crypto Table
    const numRows = ss.getRangeByName('portfolio_detail')?.getNumRows();
    if (!numRows)
        return;
    const a1Range_settings = colsSettings
        .map((colId) => ss
        .getRangeByName('portfolio_detail')
        ?.offset(0, colId, numRows, 1)
        ?.getA1Notation())
        .filter((range) => range !== undefined);
    if (!a1Range_settings)
        return;
    shMarket.getRangeList(a1Range_settings).setNumberFormat(selFormat);
    // update Row Template Sheet
    const nbRowsTemplateRowCrypto = ss
        .getRangeByName('template_row_crypto')
        ?.getNumRows();
    if (!nbRowsTemplateRowCrypto)
        return;
    const a1Range_settings2 = colsSettings
        .map((colId) => ss
        .getRangeByName('template_row_crypto')
        ?.offset(0, colId, nbRowsTemplateRowCrypto, 1)
        ?.getA1Notation())
        .filter((range) => !!range);
    shRowTemplate.getRangeList(a1Range_settings2).setNumberFormat(selFormat);
    const rangeDbHistory = ss.getRangeByName('db_history');
    if (!rangeDbHistory)
        return;
    // update db_history Sheet
    const dbHistoryNumRows = rangeDbHistory.getNumRows();
    const a1RangeSettingsDbHistory = [2, 3, 5, 6]
        .map((nCol) => rangeDbHistory.offset(0, nCol, dbHistoryNumRows, 1).getA1Notation())
        .filter((range) => range !== undefined);
    shHistory.getRangeList(a1RangeSettingsDbHistory).setNumberFormat(selFormat);
}
function formatNumber(input, options = {}) {
    const { includePlusSign = true, isPercentage = false, decimalPlaces = 2, suffix = '', } = options;
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
function getOrCreateSheet(ss, sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
    }
    return sheet;
}
function fetchJSONData(url) {
    console.log('fetching data from URL:', url);
    const data = (0,_importjson__WEBPACK_IMPORTED_MODULE_1__.ImportJSON)(url, undefined, 'noTruncate,rawHeaders');
    if (data && !data.error) {
        return data;
    }
    console.error(data?.error);
    return null;
}
function processJSONData(data, fetchId) {
    const [headers] = data;
    if (!areHeadersValid(headers)) {
        data = reorderColumns(data, headers);
    }
    else {
        console.log('valid headers received', { headers });
    }
    // Skip the header for all but the first GET
    return fetchId > 0 ? data.slice(1) : data;
}
function areHeadersValid(header) {
    return JSON.stringify(header) === JSON.stringify(_constants__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_ORDERED_SCHEMA);
}
// todo: renaming column headers would have more sense
function reorderColumns(data, headers) {
    // Create a mapping of input header indices to the desired schema indices
    const headerIndexMap = headers.reduce((map, header, index) => {
        const targetIndex = _constants__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_ORDERED_SCHEMA.indexOf(header);
        if (targetIndex !== -1) {
            map[index] = targetIndex;
        }
        else {
            console.error('Unknown column:', header);
            map[index] = -1; // Mark invalid headers
        }
        return map;
    }, {});
    console.log('Header Index Map:', headerIndexMap);
    // Reorder data rows based on the header index map
    const reorderedData = data.map((row) => {
        const reorderedRow = Array(_constants__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_ORDERED_SCHEMA.length).fill('invalid_state');
        for (const [currentIndex, targetIndex] of Object.entries(headerIndexMap)) {
            const currentIdx = parseInt(currentIndex, 10);
            if (targetIndex !== -1) {
                reorderedRow[targetIndex] = row[currentIdx];
            }
        }
        return reorderedRow;
    });
    console.log('Reordered data:', reorderedData.slice(0, 3));
    return reorderedData;
}
function writeDataToSheet(sheet, data, index, rowsPerPage) {
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
function importDataWithRetries(sheet, url, index, rowsPerPage) {
    const attemptImport = (attempt) => {
        if (attempt >= MAX_RETRIES)
            return false;
        try {
            const rawData = fetchJSONData(url);
            if (!rawData) {
                console.error(`Failed to fetch valid data from URL: ${url}`);
                return false;
            }
            const data = processJSONData(rawData, index);
            writeDataToSheet(sheet, data, index, rowsPerPage);
            return true;
        }
        catch (error) {
            console.error(`Attempt ${attempt + 1} failed for URL: ${url}`, error);
            Utilities.sleep(RETRY_DELAY_MS);
            return attemptImport(attempt + 1);
        }
    };
    return attemptImport(0);
}
function safeGuardImportJSON(urls = [], sheetName = '', rowsPerPage = 250) {
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
function getLocalNow(tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone(), format = 'dd/MM/yyyy') {
    return Utilities.formatDate(new Date(), tz, format);
}
function prepareDataRange(sourceRangeName, selectCols = []) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sourceRange = ss.getRangeByName(sourceRangeName)?.getValues();
    if (!sourceRange)
        return [[]];
    sourceRange = filterRows(sourceRange);
    sourceRange = filterColumns(sourceRange, selectCols);
    sourceRange.forEach((i) => {
        i.unshift(getLocalNow());
        i.push(getLocalNow(undefined, 'yyyy-MM-dd HH:mm:ssZ'));
    });
    return sourceRange;
    function filterRows(range, keep_headers = false) {
        const _r = range.filter((row) => row.join('').length !== 0);
        if (keep_headers) {
            return _r;
        }
        return _r.slice(1);
    }
    function filterColumns(range, columnIds) {
        if (columnIds.length === 0)
            return range;
        const totalColumns = range[0].length;
        const validColumnIds = columnIds.filter((id) => id < totalColumns);
        return range.map((row) => validColumnIds.map((colId) => row[colId]));
    }
}
function storeRows2Sheet(sourceRange, targetSheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const targetSheet = ss.getSheetByName(targetSheetName);
    if (targetSheet) {
        sourceRange.forEach((row) => targetSheet.appendRow(row));
    }
    return sourceRange;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./dist/index.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cgDataManualRefresh: () => (/* binding */ cgDataManualRefresh),
/* harmony export */   cgDataRefresh: () => (/* binding */ cgDataRefresh),
/* harmony export */   createTriggers: () => (/* binding */ createTriggers),
/* harmony export */   dailyAlertTrigger: () => (/* binding */ dailyAlertTrigger),
/* harmony export */   getDLCrypto: () => (/* reexport safe */ _discord__WEBPACK_IMPORTED_MODULE_0__.getDLCrypto),
/* harmony export */   getTemplatePayload: () => (/* reexport safe */ _discord__WEBPACK_IMPORTED_MODULE_0__.getTemplatePayload),
/* harmony export */   onEdit: () => (/* binding */ onEdit),
/* harmony export */   onOpen: () => (/* binding */ onOpen),
/* harmony export */   postMessageToDiscord: () => (/* reexport safe */ _discord__WEBPACK_IMPORTED_MODULE_0__.postMessageToDiscord),
/* harmony export */   storeRows2SheetTrigger: () => (/* binding */ storeRows2SheetTrigger),
/* harmony export */   testDiscord: () => (/* binding */ testDiscord)
/* harmony export */ });
/* harmony import */ var _discord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./discord */ "./dist/discord.js");
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib */ "./dist/lib.js");



function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Cryptofolio')
        .addItem('Create Triggers', 'createTriggers')
        .addItem('Refresh crypto prices', 'cgDataManualRefresh')
        .addItem('Discord - Test connection', 'testDiscord')
        .addItem('Discord - send reporting', 'dailyAlertTrigger')
        .addToUi();
}
function createTriggers() {
    const allTriggers = ScriptApp.getProjectTriggers();
    if (allTriggers.length < 1) {
        initTriggers();
        SpreadsheetApp.getUi().alert('Your triggers has been created. Syncronization of crypto prices enabled. Prices will be updated in a few minutes');
    }
    else {
        SpreadsheetApp.getUi().alert('Nothing done, your Spreadshet is already setup');
    }
}
function initTriggers() {
    // Trigger every 2 hours.
    ScriptApp.newTrigger('cgDataRefresh').timeBased().everyMinutes(10).create();
    ScriptApp.newTrigger('storeRows2SheetTrigger')
        .timeBased()
        .everyHours(6)
        .create();
    ScriptApp.newTrigger('dailyAlertTrigger')
        .timeBased()
        .everyDays(1)
        .atHour(8)
        .create();
}
function onEdit(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    const sh = ss.getSheetByName('Market (Mk)');
    if (!sh) {
        return;
    }
    const myRange = ss.getRange('crypto_opes');
    const existingValues = ss.getRange('crypto_market');
    const uiFormat = ss.getRange('fiat_currency');
    const activeSheet = e.source.getActiveSheet();
    const row = e.range.getRow();
    const col = e.range.getColumn();
    if (activeSheet.getName() == 'Settings') {
        if (col >= uiFormat.getColumn() &&
            col <= uiFormat.getLastColumn() &&
            row >= uiFormat.getRow() &&
            row <= uiFormat.getLastRow()) {
            (0,_lib__WEBPACK_IMPORTED_MODULE_1__.updateCurrencyFormat)();
        }
    }
    else if (activeSheet.getName() == 'Transactions (Tx)') {
        if (col >= myRange.getColumn() &&
            col <= myRange.getLastColumn() &&
            row >= myRange.getRow() &&
            row <= myRange.getLastRow()) {
            const cellValue = SpreadsheetApp.getActiveSheet()
                .getRange(row, col)
                .getValue()
                .toUpperCase();
            const cryptoRange = existingValues.getValues();
            if (cryptoRange.flat().includes(cellValue) === false) {
                const choiceBtn = ui.alert(`New Crypto Detected: ${cellValue}`, 'do you want to add it?', ui.ButtonSet.OK_CANCEL);
                if (choiceBtn == ui.Button.OK) {
                    const f = sh.getFilter();
                    if (f != null && typeof f == 'object') {
                        // todo: remove getrange
                        f.getRange();
                        f.remove();
                    }
                    const lRow = sh.getLastRow(), lCol = sh.getLastColumn();
                    const range = ss.getRange('template_row_crypto');
                    sh.insertRowsAfter(lRow, 1);
                    range.copyTo(sh.getRange(lRow + 1, 1, 1, lCol), {
                        contentsOnly: false,
                    });
                    sh.getRange(lRow + 1, 3, 1, 1).setValue(cellValue);
                    ss.setNamedRange('portfolio_detail', sh.getRange('A13:AA'));
                    ss.getRange('portfolio_detail').createFilter().sort(3, true);
                }
            }
        }
    }
}
function cgDataRefresh() {
    let currency = SpreadsheetApp.getActiveSpreadsheet()
        .getRangeByName('fiat_currency')
        ?.getValue();
    if (!currency) {
        currency = 'cad';
    }
    const urls = [
        `https://us-central1-cryptofolio-428823.cloudfunctions.net/cryptofolio-get-coins`,
    ];
    const count = (0,_lib__WEBPACK_IMPORTED_MODULE_1__.safeGuardImportJSON)(urls, 'db_coingecko');
    return count;
}
function cgDataManualRefresh() {
    const count = cgDataRefresh();
    const ui = SpreadsheetApp.getUi();
    const uiMessage = `Price refresh completed. ${count} coins updated.`;
    ui.alert('Price Refresh Status', uiMessage, ui.ButtonSet.OK);
}
function testDiscord() {
    const ui = SpreadsheetApp.getUi();
    const ping = (0,_discord__WEBPACK_IMPORTED_MODULE_0__.postMessageToDiscord)();
    let uiMessage;
    switch (ping) {
        case 'SUCCESS':
            uiMessage =
                'Test successful! The Google Sheet was correctly linked to your discord.';
            break;
        case 'ERROR_NO_VALID_WEBHOOK':
            uiMessage = `Test Failed. Please provide a valid webhook url in the sheet "SETTINGS".`;
            break;
        default:
            uiMessage = `Test Failed. there was a problem with the notification sent.`;
    }
    ui.alert('Discord Status', uiMessage, ui.ButtonSet.OK);
}
function storeRows2SheetTrigger() {
    const globalMetrics = (0,_lib__WEBPACK_IMPORTED_MODULE_1__.prepareDataRange)('total', [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
    (0,_lib__WEBPACK_IMPORTED_MODULE_1__.storeRows2Sheet)(globalMetrics, 'db_history');
}
function dailyAlertTrigger() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const discord = ss.getRangeByName('discord_webhook')?.getValue();
    if (!discord)
        return;
    const discord_daily_alert = ss.getRangeByName('discord_daily')?.getValue();
    if (!discord_daily_alert)
        return;
    const globalMetrics = (0,_lib__WEBPACK_IMPORTED_MODULE_1__.prepareDataRange)('total', [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
    const rawData = (0,_lib__WEBPACK_IMPORTED_MODULE_1__.prepareDataRange)('portfolio_detail');
    const cryptoData = (0,_discord__WEBPACK_IMPORTED_MODULE_0__.getDLCrypto)(rawData);
    // Reporting Section : Global
    const payload = (0,_discord__WEBPACK_IMPORTED_MODULE_0__.getTemplatePayload)(globalMetrics, 'daily_global');
    (0,_discord__WEBPACK_IMPORTED_MODULE_0__.postMessageToDiscord)(undefined, payload);
    // Reporting Section : Market
    const payload_market = (0,_discord__WEBPACK_IMPORTED_MODULE_0__.getTemplatePayload)(cryptoData, 'daily_market');
    (0,_discord__WEBPACK_IMPORTED_MODULE_0__.postMessageToDiscord)(undefined, payload_market);
    // Reporting Section : Portfolio
    const payload_portfolio = (0,_discord__WEBPACK_IMPORTED_MODULE_0__.getTemplatePayload)(cryptoData, 'daily_portfolio');
    (0,_discord__WEBPACK_IMPORTED_MODULE_0__.postMessageToDiscord)(undefined, payload_portfolio);
}

__webpack_require__.g.getDLCrypto = __webpack_exports__.getDLCrypto;
__webpack_require__.g.getTemplatePayload = __webpack_exports__.getTemplatePayload;
__webpack_require__.g.postMessageToDiscord = __webpack_exports__.postMessageToDiscord;
__webpack_require__.g.dailyAlertTrigger = __webpack_exports__.dailyAlertTrigger;
__webpack_require__.g.storeRows2SheetTrigger = __webpack_exports__.storeRows2SheetTrigger;
__webpack_require__.g.cgDataManualRefresh = __webpack_exports__.cgDataManualRefresh;
__webpack_require__.g.testDiscord = __webpack_exports__.testDiscord;
__webpack_require__.g.cgDataRefresh = __webpack_exports__.cgDataRefresh;
__webpack_require__.g.onEdit = __webpack_exports__.onEdit;
__webpack_require__.g.onOpen = __webpack_exports__.onOpen;
__webpack_require__.g.createTriggers = __webpack_exports__.createTriggers;
})();

/******/ })()
;