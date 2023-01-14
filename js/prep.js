/* 
    Sense Chart - Prep 
    JSDocs standard for notation
*/

define(['./d3.min'], function (d3) {
	'use strict';

	function mainPrep(scope, $element, layout) {
		if (layout.props.debug) {
			console.log('Scope PREP <<<<<<<<<');
		}
		// Store URL and Load CSS
		scope.baseUrl = window.location.pathname.substring(
			0,
			window.location.pathname.toLowerCase().indexOf('/sense') + 1
		);
		scope.extensionUrl =
			scope.baseUrl + 'Extensions/' + layout.visualization + '/';

		$.get(scope.extensionUrl + 'main.css', function (cssContent) {
			$('<style>').html(cssContent).appendTo('head');
		});

		// Prep
		scope.mainDiv = d3
			.select($element.children()[0])
			.append('div')
			.attr('class', 'qv-object-sense-target-chart main-background');

		// Div where the target svg is visualized
		scope.mainDiv.svgDiv = scope.mainDiv.append('div').attr('class', 'svg-div');
		scope.mainDiv.svgDiv.svg = scope.mainDiv.svgDiv
			.append('svg')
			.attr('width', '100%')
			.attr('height', '100%');

		// Will contain the Target Circles
		scope.mainDiv.svgDiv.svg.tc = scope.mainDiv.svgDiv.svg.append('g');

		// Will contain the Group Pie Arcs
		scope.mainDiv.svgDiv.svg.arcs = scope.mainDiv.svgDiv.svg.append('g');

		// Will contain the marks
		scope.mainDiv.svgDiv.svg.marks = scope.mainDiv.svgDiv.svg.append('g');

		// Div holding the legend split into two divs, one for Target (circles) legend and one for performance (bar chart)
		scope.mainDiv.mainLegend = scope.mainDiv
			.append('div')
			.attr('class', 'main-legend')
			.style('position', 'absolute');

		scope.mainDiv.mainLegend.targetLegend = scope.mainDiv.mainLegend
			.append('div')
			.attr('class', 'target');
		scope.mainDiv.mainLegend.targetLegend.html(
			'<p>This is the target Info</p>'
		);

		scope.mainDiv.mainLegend.targetLegend.container =
			scope.mainDiv.mainLegend.targetLegend
				.append('div')
				.attr('class', 'target-container');

		scope.mainDiv.mainLegend.targetLegend.container.one =
			scope.mainDiv.mainLegend.targetLegend.container
				.append('div')
				.attr('class', 'target-child');

		scope.mainDiv.mainLegend.targetLegend.container.two =
			scope.mainDiv.mainLegend.targetLegend.container
				.append('div')
				.attr('class', 'target-child');

		scope.mainDiv.mainLegend.targetLegend.container.three =
			scope.mainDiv.mainLegend.targetLegend.container
				.append('div')
				.attr('class', 'target-child');

		scope.mainDiv.mainLegend.performanceLegend = scope.mainDiv.mainLegend
			.append('div')
			.attr('class', 'performance')
			.style('position', 'relative');

		// Set up variables
		scope.data = [];
		scope.data.target = {};
		scope.data.group = {};

		scope.data.group.colorScale = d3
			.scaleOrdinal()
			.range([
				'#4e79a7',
				'#f28e2c',
				'#e15759',
				'#76b7b2',
				'#59a14f',
				'#edc949',
				'#af7aa1',
				'#ff9da7',
				'#9c755f',
				'#bab0ab',
			]);
	}

	return { mainPrep };
});
