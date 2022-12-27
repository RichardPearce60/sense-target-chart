define([
	'./js/properties',
	'./js/d3.min',
	'./js/lodash',
	'./js/sensejslib',
	'./js/chartlib',
], function (props, d3, _, sensejslib, chartlib) {
	'use strict';

	return {
		definition: props,
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [
					{
						qWidth: 4,
						qHeight: 2500,
					},
				],
			},
		},
		paint: function ($element, layout) {},
		resize: function ($element, layout, scope) {
			if (layout.props.debug) {
				console.log('Resize <<<<<<<<<');
			}
			try {
				this.$scope.init($element, layout);
				this.$scope.render(this.$scope.element, layout);
			} catch (err) {
				console.log(err);
			}
		},

		controller: [
			'$scope',
			'$element',
			function (scope, $element) {
				scope.prep = function (scope, $element, layout) {
					if (layout.props.debug) {
						console.log('Scope PREP & INIT <<<<<<<<<');
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
					scope.mainDiv.svgDiv = scope.mainDiv
						.append('div')
						.attr('class', 'svg-div');
					scope.mainDiv.svgDiv.svg = scope.mainDiv.svgDiv
						.append('svg')
						.attr('width', '100%')
						.attr('height', '100%');

					// Div holding the legend, one for Target (circles), one for performance (bar chart)
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

					scope.init($element, layout);
				};

				scope.init = function ($element, layout) {
					if (layout.props.debug) {
						console.log('Scope INIT <<<<<<<<<');
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

					// Reposition the standard elements
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

					if (!layout.props.debug) {
						console.log('scope main div: ', scope.mainDiv);
					}
				};

				scope.getData = function (scope, layout, d3) {
					if (layout.props.debug) {
						console.log('Scope GET DATA <<<<<<<<<');
					}

					// scope chart props
					scope.chartprops = [];

					// Set the accessors
					// This is dependent on how many dimensions / measures you have.
					/*
						1 Dim (x): Index / Name
						2 Dim (z): Group by 
						1 Exp (y): Score
						2 Exp (v): Angle

					*/
					scope.chartprops.x = (d) => d.i0;
					scope.chartprops.y = (d) => d.i1;
					// Come back to these as I do the arks

					scope.data = [];
					scope.data.names = sensejslib.dataMapNames(layout);
					scope.data.o = sensejslib.dataMapO(layout);
					scope.data.x = sensejslib.dataMap_(scope.data.o, scope.chartprops.x);
					scope.data.y = sensejslib.dataMap_(scope.data.o, scope.chartprops.y);
					scope.data.i = sensejslib.dataMapI(scope.data.x, scope.data.y);

					scope.data.g1 = sensejslib.dataGroupBy(scope.data.o, 'i0', 'i1');

					scope.data.target = {};
					scope.data.target.r = scope.mainDiv.svgDiv.width / 2;
					scope.data.target = chartlib.targetDataMap(layout, scope);

					// Set the group data for the pie arks, only if there is a second dimension
					if (layout.qHyperCube.qDimensionInfo.length === 2) {
						scope.data.group = chartlib.calculateGroupData(scope.data.o, {
							index: 'i1', // Second Dimension
							groupSumField:
								layout.qHyperCube.qMeasureInfo.length === 2 ? 'i3' : '', // Second Expression
							groupSumTitle:
								layout.qHyperCube.qMeasureInfo.length === 2
									? layout.qHyperCube.qMeasureInfo[1].qFallbackTitle
									: '', // Second Expression Label
						});

						// Arks
					}

					// Update from Props. Hide / Show / Format
					scope.mainDiv.svgDiv.classed('center', false); // Take true and false from show legend, also prop to center main svg
					scope.mainDiv.mainLegend.classed('hide', false);

					console.log('layout ', layout);

					if (!layout.props.debug) {
						console.log('Custom Props: ', layout.props);
					}
					if (layout.props.debug) {
						console.log('scope chart props: ', scope.chartprops);
					}
					if (!layout.props.debug) {
						console.log('layout HC: ', layout.qHyperCube);
					}
					if (!layout.props.debug) {
						console.log('scope data: ', scope.data);
					}
				};

				scope.render = function (element, layout) {
					if (layout.props.debug) {
						console.log('Scope RENDER <<<<<<<<<');
					}
				};
				console.log('## Extension Run ##');
				scope.prep(scope, $element, scope.layout);
				scope.getData(scope, scope.layout);
				scope.render(scope.element, scope.layout);

				scope.backendApi.model.Validated.bind(function () {
					// listens for DOM events or new data. ------------------------------------------------------------------
					if (scope.layout.props.debug) {
						console.log('Scope NEW DATA <<<<<<<<<');
					}

					try {
						scope.getData(scope, scope.layout);
						scope.render(scope.element, scope.layout);
					} catch (err) {
						console.log(err);
					}
				});

				/**
				 * Invalidated event.
				 * @description The data has been invalidated, for example by a user selection. Do not use the data.
				 */
				scope.component.model.Invalidated.bind(function () {
					if (scope.layout.props.debug) {
						console.log('Scope Invalidated <<<<<<<<<');
					}
				});

				/**
				 * Aborted event.
				 * @description Calculation has been aborted.
				 */
				// scope.component.model.Aborted.bind(function () {
				// 	console.info('Aborted');
				// });

				/**
				 * Cancelled event.
				 * @description Calculation has been cancelled.
				 */
				scope.component.model.Cancelled.bind(function () {
					if (scope.layout.props.debug) {
						console.log('Scope Cancelled <<<<<<<<<');
					}
				});

				/**
				 * Closed event.
				 * @description Connection to the Qlik engine has been closed for this object.
				 */
				scope.component.model.Closed.bind(function () {
					if (scope.layout.props.debug) {
						console.log('Scope Closed <<<<<<<<<');
					}
				});
			},
		],
	};
});
