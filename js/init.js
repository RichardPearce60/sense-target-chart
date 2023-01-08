/* 
    Sense Chart - Init 
    JSDocs standard for notation
*/

define(['./d3.min'], function (d3) {
	'use strict';

	function setVariables(scope, $element, layout) {
		if (layout.props.debug) {
			console.log('Scope INIT - Set Variables <<<<<<<<<');
		}
		scope.mainDiv.width = $element.width();
		scope.mainDiv.height = $element.height();
		scope.mainDiv.svgDiv.width = Math.min(
			scope.mainDiv.width,
			scope.mainDiv.height
		);
		scope.mainDiv.svgDiv.height = Math.min(
			scope.mainDiv.width,
			scope.mainDiv.height
		);

		scope.mainDiv.mainLegend.width =
			scope.mainDiv.width - scope.mainDiv.svgDiv.width; //<< Use a min to refactor the target
		scope.mainDiv.mainLegend.height = scope.mainDiv.height;
		scope.mainDiv.mainLegend.top = 0;
		scope.mainDiv.mainLegend.left = scope.mainDiv.svgDiv.width;
	}

	function repositionElements(layout, scope) {
		if (layout.props.debug) {
			console.log('Scope INIT - Reposition Elements <<<<<<<<<');
		}
		scope.mainDiv
			.style('height', scope.mainDiv.height + 'px')
			.style('width', scope.mainDiv.width + 'px');
		scope.mainDiv.svgDiv
			.style('height', scope.mainDiv.svgDiv.height + 'px')
			.style('width', scope.mainDiv.svgDiv.width + 'px');

		scope.mainDiv.mainLegend
			.style('height', scope.mainDiv.mainLegend.height + 'px')
			.style('width', scope.mainDiv.mainLegend.width + 'px')
			.style('top', scope.mainDiv.mainLegend.top + 'px')
			.style('left', scope.mainDiv.mainLegend.left + 'px');
	}

	function targetInit(layout, scope) {
		if (layout.props.debug) {
			console.log('Scope Target Init <<<<<<<<<');
			// Separated out as Layout and Data can both change attributes
		}

		scope.data.target.r =
			scope.mainDiv.svgDiv.width / 2 - layout.props.group.stroke.width;

		scope.data.group.arc = d3
			.arc()
			.innerRadius(scope.data.target.r * layout.props.group.innerRadius)
			.outerRadius(scope.data.target.r);

		scope.mainDiv.svgDiv.svg.arcs
			.attr(
				'transform',
				`translate(${scope.mainDiv.svgDiv.width / 2},
                           ${scope.mainDiv.svgDiv.height / 2})`
			)
			.attr('stroke', layout.props.group.stroke.color.color)
			.attr('stroke-width', layout.props.group.stroke.width)
			.attr('stroke-linejoin', 'round')
			.style('opacity', layout.props.group.opacity);

		scope.data.target.xScale = d3
			.scaleLinear()
			.domain([0, 1])
			.range([0, scope.data.target.r]);
	}

	return { setVariables, repositionElements, targetInit };
});
