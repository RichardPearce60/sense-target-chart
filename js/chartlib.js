/* 
    Sense Chart Library 
    JSDocs standard for notation

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

define(['./d3.min'], function (d3) {
	'use strict';

	/**
	 * This method takes the custom properties target data and
	 * creates an array for each target circle
	 *
	 * The min values for each target has to be a percentage and there are always three bands
	 * A = TA_Min to 1
	 * B = TB_Min to TA_Min
	 * C = 0 to TB_Min
	 *
	 * @returns {Array} returns array for use with d3 to draw the three target circles
	 */
	function targetDataMap(
		layout,
		scope,
		{ defaultFill, defaultStroke, defaultStrokeWidth }
	) {
		const T_Show = layout.props.target.show,
			TA_Max = 1,
			TA_Min = layout.props.target.a.min,
			TB_Min = layout.props.target.b.min,
			TC_Min = 0,
			TA_Color = layout.props.target.a.color.color,
			TA_Title = layout.props.target.a.title,
			TB_Color = layout.props.target.b.color.color,
			TB_Title = layout.props.target.b.title,
			TC_Color = layout.props.target.c.color.color,
			TC_Title = layout.props.target.c.title,
			strokeColor = layout.props.target.stroke.color.color,
			strokeWidth = layout.props.target.stroke.width;

		let retVal = [];
		const targetRange = [TC_Min, TB_Min, TA_Min, TA_Max];

		// Error trap2 a,b,c must be larger than the previous when multiple targets are used
		if (T_Show && TA_Min > TB_Min && TB_Min > TC_Min) {
			retVal = [
				{
					r: TA_Max, // Max is always the full radius.. Move scale to render!!
					f: TA_Color,
					s: strokeColor,
					sw: strokeWidth,
					t: TA_Title,
				},
				{
					r: TA_Min,
					f: TB_Color,
					s: strokeColor,
					sw: strokeWidth,
					t: TB_Title,
				},
				{
					r: TB_Min,
					f: TC_Color,
					s: strokeColor,
					sw: strokeWidth,
					t: TC_Title,
				},
			];
		} else if ((T_Show && TA_Min < TB_Min) || (T_Show && TB_Min < TC_Min)) {
			console.log('error a<b or b<c', TA_Min, TB_Min, TC_Min);
			// !!!!! >>>> Future we need to log the message in the main div on render
			return [];
		} else if (!T_Show) {
			// No Targets used
			retVal = [
				{
					r: TA_Max,
					f: defaultFill,
					s: defaultStroke,
					sw: defaultStrokeWidth,
					t: 'none',
				},
			];
		}

		return retVal;
	}

	/**
	 *
	 * @param {...Array} [arrays] data table data.o
	 * @param {string} [groupby] Group by field
	 * @param {string} [groupSumField] ie 'i3', field to find Min and Max for title
	 * @param {string} [groupSumTitle] ie '~qMeasureInfo[1].qFallbackTitle', field to prefix title
	 * @param {string} [colorField] ie 'i1a1', field lookup color for segmentFill. Needs to be distinct per groupby

	 * @returns {Array} Returns grouped data that can be used for the Pie Arcs
	 * @example
	 *
	 * 0: {group: 'Blue Steel', title: 'LOS 28 - 476', size: 1, segmentFill: '#263A8E'}
	 * 1: {group: 'Maison Rouge', title: 'LOS 24 - 752', size: 1, segmentFill: '#B62025'}
	 * 2: {group: 'The Wolf Pack', title: 'LOS 27 - 598', size: 1, segmentFill: '#FEB513'}
	 * 3: {group: 'Villa Virdis', title: 'LOS 25 - 585', size: 1, segmentFill: '#3F6531'}
	 *
	 */
	function calculateGroupData(
		data,
		{
			groupby, // Group by Field (would be i1 if two dimensions are used)
			groupSumField,
			groupSumTitle,
			groupSegments = 'Equal', // Not used currently
			colorField,
		}
	) {
		let groupArray = d3.map(data, (d) => {
			return d[groupby];
		});
		let uniqueGroup = _.uniq(groupArray).sort(); // Load distinct

		let arr = [];

		for (let i = 0; i < uniqueGroup.length; i++) {
			let group = uniqueGroup[i];
			let size = 0;
			let filteredData = 0;
			let title = '';

			// Future feature remove hard coded i3. Not isnull
			// Also allow to use many sum by fields.
			if (groupSumField === 'i3') {
				filteredData = d3.map(
					_.filter(data, [groupby, group]),
					(r) => r[groupSumField]
				);
				title =
					groupSumTitle +
					' ' +
					d3.min(filteredData) +
					' - ' +
					d3.max(filteredData);
			}

			let segmentFill =
				data[
					_.findIndex(data, function (o) {
						return o[groupby] == group;
					})
				][colorField];

			if (groupSegments === 'Equal') {
				//"Equal", "Frequency"
				size = 1;
			} else if (groupSegments === 'Frequency') {
				size = filteredData.length / data.length;
			}

			let obj = { group, title, size, segmentFill };
			arr.push(obj);
		}
		return arr;
	}

	return { targetDataMap, calculateGroupData };
});
