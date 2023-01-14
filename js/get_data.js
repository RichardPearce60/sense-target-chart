/* 
    Sense Chart - Get_Data 
    JSDocs standard for notation
*/

define(['./d3.min', './sensejslib', './chartlib'], function (
	d3,
	sensejslib,
	chartlib
) {
	'use strict';

	function getStandard(scope, layout) {
		if (layout.props.debug) {
			console.log('Scope GET DATA - Standard <<<<<<<<<');
		}

		console.log('layout ', layout);

		// Come back to these as I do the arks

		scope.data.label = sensejslib.dataMapNames(layout);
		scope.data.o = sensejslib.dataMapO(layout);

		// scope chart props
		scope.chartprops = [];

		// Set the accessors
		// This is dependent on how many dimensions / measures you have.
		/*
            1 Dim (x) 0: Index / Name
            2 Dim (z) 1: Group by 
            1 Exp (y) 2: Score
            2 Exp (v) 3: Angle

        */

		scope.chartprops.x = (d) => d.i0; // Index / Names
		scope.data.x = sensejslib.dataMap_(scope.data.o, scope.chartprops.x);

		if (layout.qHyperCube.qDimensionInfo.length === 1) {
			scope.chartprops.y = (d) => d.i1; // Scores
		} else if (layout.qHyperCube.qDimensionInfo.length === 2) {
			scope.chartprops.z = (d) => d.i1; // Group By
			scope.chartprops.y = (d) => d.i2; // Scores
			scope.data.z = sensejslib.dataMap_(scope.data.o, scope.chartprops.z);
		}

		scope.data.y = sensejslib.dataMap_(scope.data.o, scope.chartprops.y);

		if (layout.qHyperCube.qMeasureInfo.length === 2) {
			scope.chartprops.a = (d) => d.i3; // Angle
			scope.data.a = sensejslib.dataMap_(scope.data.o, scope.chartprops.a);
		}
	}

	function pieChart(scope, layout) {
		scope.data.group.o = chartlib.calculateGroupData(scope.data.o, {
			groupby: 'i1', // Second Dimension
			groupSumField: layout.qHyperCube.qMeasureInfo.length === 2 ? 'i3' : '', // Second Expression
			groupSumTitle:
				layout.qHyperCube.qMeasureInfo.length === 2
					? layout.qHyperCube.qMeasureInfo[1].qFallbackTitle
					: '', // Second Expression Label
			colorField: 'i1a0',
		});

		// Generate Arcs / Pie Chart Information.
		scope.data.group.arcV = d3.map(scope.data.group.o, (r) => r.size);
		scope.data.group.arcI = d3
			.range(scope.data.group.arcV.length)
			.filter((i) => !isNaN(scope.data.group.arcV[i]));

		scope.data.group.arcs = d3
			.pie()
			.startAngle((-90 * Math.PI) / 180)
			.endAngle((-90 * Math.PI) / 180 + 2 * Math.PI)
			.padAngle(0)
			.sort(null)
			.value((i) => scope.data.group.arcV[i])(scope.data.group.arcI);

		// Add Group Information to Arcs, required by calculateMarkData
		// Not really happy with this but I'm tired and its Friday...
		for (let i = 0; i < scope.data.group.arcs.length; i++) {
			scope.data.group.arcs[i] = Object.assign(scope.data.group.arcs[i], {
				i1: scope.data.group.o[i].group,
			});
		}
	}

	return {
		getStandard,
		pieChart,
	};
});
