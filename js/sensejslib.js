/* 
    Sense js Library V1.0.0

    JSDocs standard for notation
    prefix: 
        data
        find
        convert

	Example:

    /##
       * This method is like `_.union` except that it accepts `comparator` which
       * is invoked to compare elements of `arrays`. Result values are chosen from
       * the first array in which the value occurs. The comparator is invoked
       * with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.unionWith(objects, others, _.isEqual);
       * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
    #/    
*/

define([], function () {
	'use strict';

	/**
	 * # dataMapO
	 *
	 * Converts Qlik layout Hypercube to O (original) dataset,
	 * Field Names are i0, i1, i2 etc Dimensions first then Measures
	 *
	 * Custom field Attributes are named i0a0, i0a1, i1a0, etc
	 *
	 * The field name is used as an accessor for other data map functions
	 *
	 * @param {obj} layout - Qlik Sense Layout Object
	 * @returns {array} Array - Array of all the data matrix index and values
	 */
	function dataMapO(layout) {
		let retVal = [],
			fieldVal = {};
		layout.qHyperCube.qDataPages[0].qMatrix.forEach((row, i) => {
			row.forEach((field, i) => {
				let fieldname = 'i' + i;
				let fieldValue = field.qNum;
				if (fieldValue == 'NaN') {
					fieldValue = field.qText;
				}
				// Concat the new info to fieldVal
				fieldVal = Object.assign(fieldVal, { [fieldname]: fieldValue });

				if (field.qAttrExps) {
					// Look for any additional attr fields
					field.qAttrExps.qValues.forEach((attr, i) => {
						let attrName = fieldname + 'a' + i;
						let fieldValue = attr.qNum;
						if (fieldValue == 'NaN') {
							fieldValue = attr.qText;
						}

						// Concat the new info to fieldVal
						fieldVal = Object.assign(fieldVal, { [attrName]: fieldValue });
					});
				}
			});
			retVal.push(fieldVal);
			fieldVal = {};
		});
		return retVal;
	}

	/**
	 * DATA I
	 *
	 * Determines which index's have values
	 * @param {array} names N or X array
	 * @param {array} values V array
	 * @returns
	 */
	function dataMapI(names, values) {
		return d3.range(names.length).filter((i) => !isNaN(values[i]));
	}

	/**
	 * DATAMAP_
	 *
	 * Map data to new array using accessor (a)
	 * @param {*} data (data.o)
	 * @param {*} accessor ie (d) => d.i1
	 * @returns {array}
	 */
	function dataMap_(data, a) {
		return data.map(a);
	}

	/**
	 * Index of all dimension / measure labels
	 * @param {*} layout - Qlik Sense Layout Object
	 * @returns {array} Array
	 */
	function dataMapNames(layout) {
		let retVal = [];
		layout.qHyperCube.qDimensionInfo.forEach((d) =>
			retVal.push(d.qGroupFieldDefs[0])
		);
		layout.qHyperCube.qMeasureInfo.forEach((d) =>
			retVal.push(d.qFallbackTitle)
		);
		return retVal;
	}

	/**
	 * Groupby and sum array
	 * @param {array} data
	 * @param {string} gf Group by Field
	 * @param {string} sf0 Sum Field 0
	 * @returns {array} new array
	 *
	 * Change gf, sf_a to object {} (new major version)
	 */

	function dataGroupBy(data, gf, sf_a = {}) {
		var retVal = [];
		data.reduce(function (res, value) {
			if (!res[value[gf]]) {
				res[value[gf]] = {
					Id: value[gf],
					[sf_a]: 0,
				};
				retVal.push(res[value[gf]]);
			}
			res[value[gf]][sf_a] += value[sf_a];
			return res;
		}, {});

		return retVal;
	}

	/**
	 * Converts distinct field values into csv
	 * @param field - Qlik Sense field name
	 * @returns {string} string - "field A, field B, field C"
	 */
	function convertFieldValueCSV(field) {
		let retVal = '';
		for (let i = 0; i < field.length; i++) {
			retVal = retVal + field[i].qFallbackTitle + ', ';
		}
		return retVal.substring(0, retVal.length - 2);
	}

	/**
	 * Takes a date number (ISO) and converts into a JavaScript date
	 * @param {!number} serial - iso serial number
	 * @returns {date} date - javascript data
	 */
	function convertExcelISOToJSDate(serial) {
		// Try and find a good date library!
		var utc_days = Math.floor(serial - 25569);
		var utc_value = utc_days * 86400;
		var date_info = new Date(utc_value * 1000);
		var fractional_day = serial - Math.floor(serial) + 0.0000001;
		var total_seconds = Math.floor(86400 * fractional_day);
		var seconds = total_seconds % 60;
		total_seconds -= seconds;
		var hours = Math.floor(total_seconds / (60 * 60));
		var minutes = Math.floor(total_seconds / 60) % 60;
		return new Date(
			date_info.getFullYear(),
			date_info.getMonth(),
			date_info.getDate(),
			hours,
			minutes,
			seconds
		);
	}

	/**
	 * Checks an array of numbers and returns the closest value to the Target
	 * @param {Array.<number>} array - numbers only
	 * @param {number} target - value to find closest match
	 * @returns {number} value = closest value found
	 */
	function findClosestValue(arr, target) {
		let curr = arr[0];
		let diff = Math.abs(target - curr);
		for (var val = 0; val < arr.length; val++) {
			var newdiff = Math.abs(target - arr[val]);
			if (newdiff < diff) {
				diff = newdiff;
				curr = arr[val];
			}
		}
		return curr; // Value
	}

	return {
		convertFieldValueCSV,
		convertExcelISOToJSDate,
		findClosestValue,
		dataMapO,
		dataMapI,
		dataMap_,
		dataMapNames,
		dataGroupBy,
	};
});
