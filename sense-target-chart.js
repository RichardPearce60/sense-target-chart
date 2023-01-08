define([
	'./js/properties',
	'./js/d3.min',
	'./js/lodash',
	'./js/sensejslib',
	'./js/chartlib',
	'./js/prep',
	'./js/init',
	'./js/get_data',
], function (props, d3, _, sensejslib, chartlib, prep, init, data) {
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
				scope.init = function ($element, layout) {
					if (layout.props.debug) {
						console.log('Scope INIT <<<<<<<<<');
					}

					init.setVariables(scope, $element, layout);
					init.repositionElements(layout, scope);
					init.targetInit(layout, scope);

					if (layout.props.debug) {
						console.log('scope main div: ', scope.mainDiv);
					}
				};

				scope.getData = function (scope, layout, d3) {
					if (layout.props.debug) {
						console.log('Scope GET DATA <<<<<<<<<');
					}
					// Set Accessors and Get O, X, Y, I, N etc
					data.getStandard(scope, layout);

					// Set the target circle data
					scope.data.target.o = chartlib.targetDataMap(layout, {
						defaultFill: '#f7f7f7',
						defaultStroke: '#000',
						defaultStrokeWidth: 0.7,
					});

					// Used if no user color defined
					scope.data.group.colorScale.domain(_.sortedUniq(scope.data.z));

					// Set the group data for the pie arcs, only if there is a second dimension
					if (layout.qHyperCube.qDimensionInfo.length === 2) {
						data.pieChart(scope, layout);
					}

					// Initialize the Target with the new data
					init.targetInit(layout, scope);

					// Calculate Marks......
					scope.data.mark = {};
					scope.data.mark.o = chartlib.calculateMarkData(
						scope.data.o,
						scope.data.group.arcs,
						{
							dataV: scope.data.y,
							dataA: scope.data.a,
							showGroups:
								layout.qHyperCube.qDimensionInfo.length === 2 ? true : false,
							sortTypeRandom:
								layout.qHyperCube.qMeasureInfo.length !== 2 ? true : false,
							markScale: layout.props.mark.scale,
						}
					);

					// Update from Props. Hide / Show / Format
					scope.mainDiv.svgDiv.classed('center', false); // Take true and false from show legend, also prop to center main svg
					scope.mainDiv.mainLegend.classed('hide', false);

					if (layout.props.debug) {
						console.log('Custom Props: ', layout.props);
						console.log('scope chart props: ', scope.chartprops);
						console.log('layout HC: ', layout.qHyperCube);
						console.log('scope data: ', scope.data);
						console.table('scope data O: ', scope.data.o[0]);
					}
				};

				scope.render = function (element, layout) {
					if (layout.props.debug) {
						console.log('Scope RENDER <<<<<<<<<');
					}

					// Target Circles
					chartlib.drawTargets(scope.data.target.o, {
						svg: scope.mainDiv.svgDiv.svg.tc,
						x: scope.mainDiv.svgDiv.width / 2,
						y: scope.mainDiv.svgDiv.height / 2,
						Range: [0, scope.data.target.r],
					});

					// Pie arcs if required
					if (layout.qHyperCube.qDimensionInfo.length === 2) {
						chartlib.drawGroupArcs(scope.data.group.arcs, scope.data.group.o, {
							svg: scope.mainDiv.svgDiv.svg.arcs,
							arc: scope.data.group.arc,
							defaultColorScale: scope.data.group.colorScale,
						});
					}
				};
				console.log('## Extension Run ##');
				prep.mainPrep(scope, $element, scope.layout);
				scope.init($element, scope.layout);
				scope.getData(scope, scope.layout, d3);
				scope.render(scope.element, scope.layout);

				scope.backendApi.model.Validated.bind(function () {
					// listens for DOM events or new data. ------------------------------------------------------------------
					if (scope.layout.props.debug) {
						console.log('Scope NEW DATA <<<<<<<<<');
					}

					try {
						scope.getData(scope, scope.layout, d3);
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
