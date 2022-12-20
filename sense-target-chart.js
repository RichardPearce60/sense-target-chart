

define([
	'./js/properties',
	'./js/d3.min',
	'./js/lodash',
	'./js/sensejslib',
	'./js/chartlib'
],
	function (props
		, d3
		, _
		, sensejslib
	) {

		'use strict';

		return {
			definition: props,
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [
						{
							qWidth: 10,
							qHeight: 10
						}
					]
				}
			},
			paint: function ($element, layout) { },
			resize: function ($element, layout, scope) {
				if (layout.props.debug) { console.log("Resize <<<<<<<<<") }
				try {
					this.$scope.init($element, layout);
					this.$scope.render(this.$scope.element, layout);
				} catch (err) { console.log(err) }
			},

			controller: ['$scope', '$element', function (scope, $element) {

				scope.prep = function (scope, $element, layout) {
					if (layout.props.debug) { console.log("Scope PREP & INIT <<<<<<<<<") }
					// Store URL and Load CSS
					scope.baseUrl = window.location.pathname.substring(0, window.location.pathname.toLowerCase().indexOf("/sense") + 1);
					scope.extensionUrl = scope.baseUrl + 'Extensions/' + layout.visualization + '/';

					$.get(scope.baseUrl + (scope.baseUrl.slice(-1) === "/" ? "" : "/") + "Extensions/sense-target-chart/main.css", function (cssContent) {
						$("<style>").html(cssContent).appendTo("head");
					});

					// Prep
					scope.mainDiv = d3.select($element.children()[0]).append('div').attr("class", "qv-object-sense-target-chart main-background")

					scope.init($element, layout);
				};

				scope.init = function ($element, layout) {
					if (layout.props.debug) { console.log("Scope INIT <<<<<<<<<") }

					scope.mainDiv.width = $element.width()
					scope.mainDiv.height = $element.height()

					// Reposition the standard elements
					d3.select('.main-background').style("height", scope.mainDiv.height + "px").style("width", scope.mainDiv.width + "px")
					// scope chart props
					scope.chartprops = [];
					scope.chartprops.x = d => d.i0;
					scope.chartprops.y = d => d.i2;

					if (layout.props.debug) { console.log('scope chart props: ', scope.chartprops) }
				};

				scope.getData = function (scope, layout) {
					if (layout.props.debug) { console.log("Scope GET DATA <<<<<<<<<") }
					scope.data = [];
					scope.data.names = sensejslib.dataMapNames(layout)
					scope.data.o = sensejslib.dataMapO(layout)
					scope.data.x = sensejslib.dataMap_(scope.data.o, scope.chartprops.x)
					scope.data.y = sensejslib.dataMap_(scope.data.o, scope.chartprops.y)
					scope.data.i = sensejslib.dataMapI(scope.data.x, scope.data.y)

					scope.data.g1 = sensejslib.dataGroupBy(scope.data.o, 'i0', 'i3')




					if (layout.props.debug) { console.log('layout HC: ', layout.qHyperCube) }
					if (layout.props.debug) { console.log('scope data: ', scope.data) }
				};





				scope.render = function (element, layout) {
					if (layout.props.debug) { console.log("Scope RENDER <<<<<<<<<") }

				};
				//console.log('## Extension Run ##') 
				scope.prep(scope, $element, scope.layout);
				scope.getData(scope, scope.layout)
				scope.render(scope.element, scope.layout)

				scope.backendApi.model.Validated.bind(function (a, b) {
					// listens for DOM events or new data. ------------------------------------------------------------------
					if (scope.layout.props.debug) { console.log("Scope NEW DATA <<<<<<<<<") }

					try {
						scope.getData(scope.layout);
						scope.render(scope.element, scope.layout);
					} catch (err) {
						console.log(err)
					}
				})
			}]
		};
	}
);
