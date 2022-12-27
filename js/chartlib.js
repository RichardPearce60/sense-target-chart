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
	function targetDataMap(layout, scope) {
		const T_Show = layout.props.target.show,
			TA_Max = 1,
			TA_Min = layout.props.target.a.min,
			TB_Min = layout.props.target.b.min,
			TC_Min = 0,
			CenterX = scope.mainDiv.svgDiv.width / 2,
			CenterY = scope.mainDiv.svgDiv.height / 2,
			ScaleType = d3.scaleLinear,
			Domain = [0, 1],
			Range = [0, scope.data.target.r],
			TA_Color = layout.props.target.a.color.color,
			TA_Title = layout.props.target.a.title,
			TB_Color = layout.props.target.b.color.color,
			TB_Title = layout.props.target.b.title,
			TC_Color = layout.props.target.c.color.color,
			TC_Title = layout.props.target.c.title,
			strokeColor = layout.props.target.stroke.color.color,
			strokeWidth = layout.props.target.stroke.width;

		console.log('>> targetDataMap', d3);
		let retVal = [];
		const targetRange = [TC_Min, TB_Min, TA_Min, TA_Max];

		const targetScale = ScaleType(Domain, Range);
		//const targetScale = d3.scaleLinear().domain([0, 1]).range([0, 200]);

		console.log({ targetScale });

		// Error trap2 a,b,c must be larger than the previous when multiple targets are used
		if (T_Show && TA_Min > TB_Min && TB_Min > TC_Min) {
			retVal = [
				{
					x: CenterX,
					y: CenterY,
					r: targetScale(TA_Max), // Max is always the full radius
					f: TA_Color,
					s: strokeColor,
					sw: strokeWidth,
					t: TA_Title,
				},
				{
					x: CenterX,
					y: CenterY,
					r: targetScale(TA_Min),
					f: TB_Color,
					s: strokeColor,
					sw: strokeWidth,
					t: TB_Title,
				},
				{
					x: CenterX,
					y: CenterY,
					r: targetScale(TB_Min),
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
					x: CenterX,
					y: CenterY,
					r: targetScale(TA_Max),
					f: 'none',
					s: 'none',
					sw: 'none',
					t: 'none',
				},
			];
		}

		return retVal;
	}

	/**
	 *
	 * @param {array} data O from Qlik
	 * @param {*} param1
	 * @returns {Array} Returns grouped data that can be used for the Pie Arcs
	 * @example
	 *
	 * 0: {group: 'Blue Steel', title: 'LOS 28 - 476', size: 1}
	 * 1: {group: 'Maison Rouge', title: 'LOS 24 - 752', size: 1}
	 * 2: {group: 'The Wolf Pack', title: 'LOS 27 - 598', size: 1}
	 * 3: {group: 'Villa Virdis', title: 'LOS 25 - 585', size: 1}
	 *
	 */
	function calculateGroupData(
		data,
		{
			index, // Group by Field (would be i1 if two dimensions are used)
			groupSumField,
			groupSumTitle,
			groupSegments = 'Equal', // Not used currently
		}
	) {
		console.log('>>> Calculate Group', groupSumField);

		let groupArray = d3.map(data, (d) => {
			return d[index];
		});
		let uniqueGroup = _.uniq(groupArray).sort();

		let arr = [];

		for (let i = 0; i < uniqueGroup.length; i++) {
			let group = uniqueGroup[i];
			let size = 0;
			let filteredData = 0;
			let title = '';

			if (groupSumField === 'i3') {
				filteredData = d3.map(
					_.filter(data, [index, group]),
					(r) => r[groupSumField]
				);
				title =
					groupSumTitle +
					' ' +
					d3.min(filteredData) +
					' - ' +
					d3.max(filteredData);
			}

			// let segmentFill =
			// 	data[
			// 		_.findIndex(data, function (o) {
			// 			return o[index] == group;
			// 		})
			// 	][fillColorField];

			if (groupSegments === 'Equal') {
				//"Equal", "Frequency"
				size = 1;
			} else if (groupSegments === 'Frequency') {
				size = filteredData.length / data.length;
			}

			let obj = { group, title, size };
			arr.push(obj);
		}
		return arr;
	}

	return { targetDataMap, calculateGroupData };
});
