/* 
    Sense Chart - Render
    JSDocs standard for notation
*/

define(['./d3.min'], function (d3) {
	'use strict';
	/**
	 * # drawTargets
	 *
	 * Draws an svg circle for each target specified in the properties
	 *
	 * @param {arr} [data] - uses scope.data.target.o generated in  chartlib.targetDataMap
	 * @param {*} [svg] - Target SVG to append new svg objects
	 * @param {int} [x] - cx main svg width / 2
	 * @param {int} [y] - cy main svg height / 2
	 */
	function drawTargets(
		data,
		{ svg, x, y, ScaleType = d3.scaleLinear, Domain = [0, 1], Range }
	) {
		const targetScale = ScaleType(Domain, Range);

		svg
			.selectAll('circle')
			.data(data, function (d) {
				return d;
			})
			.join(
				(enter) => {
					let entered = enter
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', (d) => targetScale(d.r))
						.attr('fill', (d) => d.f)
						.attr('stroke', (d) => d.s)
						.attr('stroke-width', (d) => d.sw);
				},
				(update) => {
					let updated = update
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', (d) => targetScale(d.r))
						.attr('fill', (d) => d.f)
						.attr('stroke', (d) => d.s)
						.attr('stroke-width', (d) => d.sw);
				}
			);
	}

	/**
	 * # drawGroupArcs
	 *
	 * Draws pie chart arcs
	 *
	 * @param {*} data - uses ard data scope.data.group.arcs
	 * @param {*} groupData - data about the groups ie fill scope.data.group.o
	 * @param {*} svg - Target SVG to append new svg objects
	 * @param {*} arc - d3.arc function
	 */
	function drawGroupArcs(data, groupData, { svg, arc, defaultColorScale }) {
		const pieArcs = svg
			.selectAll('path')
			.data(data, function (d) {
				return d.index;
			})
			.join(
				(enter) => {
					let entered = enter
						.append('path')
						.attr('fill', (d) => {
							if (!groupData[d.index].fill) {
								return defaultColorScale(groupData[d.index].group);
							}
							return groupData[d.index].fill;
						})
						.attr('d', arc);
				},
				(update) => {
					let updated = update
						//.select('path')
						.attr('fill', (d) => {
							if (!groupData[d.index].fill) {
								return defaultColorScale(groupData[d.index].group);
							}
							return groupData[d.index].fill;
						})
						.attr('d', arc);
				}
			);
	}

	return { drawTargets, drawGroupArcs };
});
