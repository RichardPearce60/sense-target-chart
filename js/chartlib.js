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
	 * # targetDataMap
	 *
	 * This method takes the custom properties target data and
	 * creates an array for each targets circle
	 *
	 * The min values for each target has to be a percentage and there are always three bands
	 * A = TA_Min to 1
	 * B = TB_Min to TA_Min
	 * C = 0 to TB_Min
	 * @param {obj} [layout] - Qlik Layout object for user props
	 * @returns {Array} returns array for use with d3 to draw the three target circles
	 */
	function targetDataMap(
		layout,
		{ defaultFill, defaultStroke, defaultStrokeWidth }
	) {
		const T_Show = layout.props.target.show,
			TA_Max = 1,
			TA_Min = 1 - layout.props.target.a.min,
			TB_Min = 1 - layout.props.target.b.min,
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

		// 0.09
		// 0.199
		// 0

		if (
			T_Show
			//&& TA_Min < TB_Min && TB_Min > TC_Min
		) {
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
		} else if ((T_Show && TA_Min > TB_Min) || (T_Show && TB_Min < TC_Min)) {
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
	 * # CalculateGroupData
	 * 
	 * Used specifically for the Target pie charts, takes data.o and groups
	 * Additionally add color from field attributes
	 * Can generates size from frequency but is defaulted to equal groups
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

			// if segment fill is empty then apply some color scales!

			if (groupSegments === 'Equal') {
				//"Equal", "Frequency"
				size = 1;
			} else if (groupSegments === 'Frequency') {
				size = filteredData.length / data.length;
			}

			let obj = { group, title, size, fill: segmentFill };
			arr.push(obj);
		}
		return arr;
	}

	/**
	 * # Calculate Mark Data
	 *
	 * Takes the main data.o and the defined d3.pie function
	 * and creates all the data required to draw the marks
	 *
	 * @param {arr} [data] - uses scope.data.o
	 * @param {} [arc] - d3.arc function
	 * @param {arr} [dataV] - First measure values (v for values)
	 * @param {arr} [dataA] - second measure values (a for angle)
	 *
	 * @param {string} [groupByField] - Used when group are present (same field)
	 * @returns {array} [extentField] - Field extent is applied to in the groupBy (ie Length of Service)
	 * @example
	 *
	 *
	 */
	function calculateMarkData(
		data,
		arcs,
		{
			firstMeasure = 'i2', // Ie score
			groupByField = 'i1', // ie House Name
			extentField = 'i3', // ie LOS
			dataV,
			dataA,
			showGroups,
			sortTypeRandom,
			markColor = 'i0a0',
			markPath = 'M-2,-2 L2,2 M-2,2 L2,-2',
			markScale = 1,
		}
	) {
		//

		// Set up scales for the angles *******************************************
		let arcScale = [],
			domain = 0;

		const radians_to_degrees = (radians) => {
			var pi = Math.PI;
			return radians * (180 / pi);
		};

		const getRandomInt = (max) => {
			return Math.floor(Math.random() * max);
		};

		console.log({ showGroups, sortTypeRandom });
		console.log(d3.extent(dataV));

		if (showGroups) {
			// Generate a scale for each group
			for (let i = 0; i < arcs.length; i++) {
				let range = [
					radians_to_degrees(arcs[i].startAngle),
					radians_to_degrees(arcs[i].endAngle),
				];

				if (!sortTypeRandom) {
					domain = d3.extent(
						d3.map(
							_.filter(data, [groupByField, arcs[i][groupByField]]),
							(r) => r[extentField]
						)
					);
				} else {
					domain = [0, 1000]; // Will use a random number between these two extents
				}

				arcScale[i] = d3.scaleLinear().domain(domain).range(range);
			}
		} else if (!showGroups) {
			// If its random we don't need the scale, we define the angle with a rnd number between 1 - 360
			if (!sortTypeRandom) {
				arcScale[0] = d3.scaleLinear().domain(d3.extent(dataA)).range([1, 359]);
			}
		}

		// Calculate the Marks **********************************

		let retVal = [];

		for (let i = 0; i < data.length; i++) {
			let id = i;
			let score = data[i][firstMeasure];
			let rotate = 0;

			if (sortTypeRandom && !showGroups) {
				rotate = getRandomInt(358) + 1;
			} else if (sortTypeRandom && showGroups) {
				// Random within the confines of the arc
				rotate = arcScale[
					_.findIndex(arcs, { [groupByField]: data[i][groupByField] })
				](getRandomInt(1000));
			} else if (!sortTypeRandom && showGroups) {
				rotate = arcScale[
					_.findIndex(arcs, { [groupByField]: data[i][groupByField] }) // Using the group by field (same on both data and arcs) we find the index
				](data[i][extentField]);
			} else if (!sortTypeRandom && !showGroups) {
				rotate = arcScale[0](data[i][extentField]);
			}

			rotate = rotate - 90; // Resolve the starting angle to 0

			let inverseRotate = 0;
			if (rotate > 0) {
				inverseRotate = -Math.abs(rotate);
			} else {
				inverseRotate = Math.abs(rotate);
			}

			// MOVE THE SCALE TO THE RENDER !!!!!!!
			//let x = scope.target.xScale(1 - data[i][firstMeasure]);
			let x = 1 - data[i][firstMeasure];

			let house_name = data[i][groupByField];

			let stroke = '#000';
			if (data[i][markColor]) {
				stroke = data[i][markColor];
			}

			let obj = {
				id,
				score,
				rotate,
				inverseRotate,
				x,
				scale: markScale,
				path: markPath,
				house_name,
				stroke,
			};
			retVal.push(obj);
		}

		return retVal;
	}

	// Standard prep, init, getData functions

	return {
		targetDataMap,
		calculateGroupData,
		calculateMarkData,
	};
});
