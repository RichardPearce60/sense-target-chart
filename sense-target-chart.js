

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

					$.get(scope.extensionUrl +  "main.css", function (cssContent) {
						$("<style>").html(cssContent).appendTo("head");
					});

					// Prep
					scope.mainDiv = d3.select($element.children()[0]).append('div').attr("class", "qv-object-sense-target-chart main-background")

					// Div where the target svg is visualized
					scope.mainDiv.svgDiv = scope.mainDiv.append('div').attr("class","svg-div")
					scope.mainDiv.svgDiv.svg = scope.mainDiv.svgDiv.append('svg').attr("width","100%").attr("height","100%")
					
					// Div holding the legend, one for Target (circles), one for performance (bar chart)
					scope.mainDiv.mainLegend = scope.mainDiv.append('div').attr("class","main-legend").style("position","absolute")
					
					scope.mainDiv.mainLegend.targetLegend = scope.mainDiv.mainLegend.append('div').attr("class","target")
					scope.mainDiv.mainLegend.targetLegend.html('<p>This is the target Info</p>')

					scope.mainDiv.mainLegend.targetLegend.container = scope.mainDiv.mainLegend.targetLegend.append('div').attr("class","target-container")
					scope.mainDiv.mainLegend.targetLegend.container.one = scope.mainDiv.mainLegend.targetLegend.container.append('div').attr("class","target-child")
					scope.mainDiv.mainLegend.targetLegend.container.two = scope.mainDiv.mainLegend.targetLegend.container.append('div').attr("class","target-child")
					scope.mainDiv.mainLegend.targetLegend.container.three = scope.mainDiv.mainLegend.targetLegend.container.append('div').attr("class","target-child")

					scope.mainDiv.mainLegend.performanceLegend = scope.mainDiv.mainLegend.append('div').attr("class","performance").style("position","relative")


					scope.init($element, layout);
				};

				scope.init = function ($element, layout) {
					if (layout.props.debug) { console.log("Scope INIT <<<<<<<<<") }

					scope.mainDiv.width = $element.width()
					scope.mainDiv.height = $element.height()
					scope.mainDiv.svgDiv.width = Math.min(scope.mainDiv.width,scope.mainDiv.height)
					scope.mainDiv.svgDiv.height = Math.min(scope.mainDiv.width,scope.mainDiv.height)
					
					scope.mainDiv.mainLegend.width = scope.mainDiv.width - scope.mainDiv.svgDiv.width //<< Use a min to refactor the target
					scope.mainDiv.mainLegend.height = scope.mainDiv.height
					scope.mainDiv.mainLegend.top = 0
					scope.mainDiv.mainLegend.left = scope.mainDiv.svgDiv.width


					// Reposition the standard elements
					scope.mainDiv.style("height", scope.mainDiv.height + "px").style("width", scope.mainDiv.width + "px")
					scope.mainDiv.svgDiv.style("height", scope.mainDiv.svgDiv.height + "px").style("width", scope.mainDiv.svgDiv.width + "px")

					scope.mainDiv.mainLegend.style("height", scope.mainDiv.mainLegend.height + "px")
											.style("width", scope.mainDiv.mainLegend.width + "px")
											.style("top", scope.mainDiv.mainLegend.top +"px")		
											.style("left", scope.mainDiv.mainLegend.left +"px")			


					// scope chart props
					scope.chartprops = [];
					scope.chartprops.x = d => d.i0;
					scope.chartprops.y = d => d.i2;

					if (layout.props.debug) { console.log('scope main div: ', scope.mainDiv) }
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


					// Update from Props. Hide / Show / Format
					scope.mainDiv.svgDiv.classed('center',false);  // Take true and false from show legend
					scope.mainDiv.mainLegend.classed('hide',false)

					if (layout.props.debug) { console.log('layout HC: ', layout.qHyperCube) }
					if (layout.props.debug) { console.log('scope data: ', scope.data) }
				};





				scope.render = function (element, layout) {
					if (layout.props.debug) { console.log("Scope RENDER <<<<<<<<<") }

				};
				console.log('## Extension Run ##') 
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
