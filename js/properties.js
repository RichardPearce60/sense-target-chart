define([], function () {
	'use strict';

	// *****************************************************************************
	// Dimensions & Measures
	// *****************************************************************************
	const dimensions = {
		uses: 'dimensions',
		min: 1,
		max: 2,
		type: 'items',
		items: {
			colorAttr: {
				type: 'string',
				component: 'expression',
				label: 'Attr Color',
				ref: 'qAttributeExpressions.0.qExpression', // This places the data: qDataPages[0].qMatrix.[0][1].qAttrExps.qValues[0].qText
				expression: 'optional',
			},
		},
	};
	/*
		Expression Example:
		=if(HouseName='Maison Rouge','#B62025',
			if(HouseName='Blue Steel','#263A8E',
			if(HouseName='The Wolf Pack','#FEB513',
			if(HouseName='Villa Virdis','#3F6531',))))

		Still need to work out how to only have it on Dimension two...		
	*/

	const measures = {
		uses: 'measures',
		min: 1,
		max: 2,
	};
	const sorting = {
		uses: 'sorting',
	};

	const markProps = {
		label: 'Mark',
		type: 'items',
		grouped: true,
		items: {
			groupA: {
				type: 'items',
				items: {
					scaleProp: {
						label: 'Mark Size',
						ref: 'props.mark.scale',
						component: 'slider',
						type: 'number',
						min: 0.4,
						max: 1.5,
						step: 0.1,
						defaultValue: 0.8,
					},
				},
			},
		},
	};

	const groupProps = {
		label: 'Group',
		type: 'items',
		grouped: true,
		items: {
			groupA: {
				type: 'items',
				items: {
					StringProp: {
						label: 'Groups are only available with a second dimension',
						component: 'text',
					},
					opacityProp: {
						label: 'Opacity',
						ref: 'props.group.opacity',
						component: 'slider',
						type: 'number',
						min: 0,
						max: 1,
						step: 0.05,
						defaultValue: 0.5,
					},
					innerRadiusProp: {
						label: 'Inner Radius',
						ref: 'props.group.innerRadius',
						component: 'slider',
						type: 'number',
						min: 0,
						max: 1,
						step: 0.05,
						defaultValue: 0,
					},
					strokeWidthProp: {
						label: 'Stroke Width',
						ref: 'props.group.stroke.width',
						component: 'slider',
						type: 'number',
						min: 0,
						max: 3,
						step: 0.1,
						defaultValue: 1,
					},
					strokeColorProp: {
						label: 'Stroke Color',
						component: 'color-picker',
						type: 'object',
						ref: 'props.group.stroke.color',
						defaultValue: { color: '#ff5866', index: '-1' },
					},
				},
			},
		},
	};

	/**
	 * Only Set for percentage, has to be between 0 and 1
	 */
	const targetProps = {
		label: 'Target',
		type: 'items',
		grouped: true,
		items: {
			groupA: {
				type: 'items',
				items: {
					CheckProp: {
						type: 'boolean',
						label: 'Use Targets',
						ref: 'props.target.show',
						defaultValue: false,
					},
					StringProp: {
						ref: 'props.target.a.title',
						label: 'Target Name',
						type: 'string',
						defaultValue: 'Red',
						show: function (e) {
							if (e.props.target.show === true) {
								return true;
							}
							return false;
						},
					},
					targetRange: {
						type: 'number',
						label: '# < Target',
						ref: 'props.target.a.min',
						defaultValue: '0.5',
						show: function (e) {
							if (e.props.target.show === true) {
								return true;
							}
							return false;
						},
					},
					colorProp: {
						component: 'color-picker',
						type: 'object',
						ref: 'props.target.a.color',
						defaultValue: { color: '#ff5866', index: '-1' },
						show: function (e) {
							if (e.props.target.show === true) {
								return true;
							}
							return false;
						},
					},
				},
			},
			groupB: {
				type: 'items',
				show: function (e) {
					if (e.props.target.show === true) {
						return true;
					}
					return false;
				},
				items: {
					StringProp: {
						ref: 'props.target.b.title',
						label: 'Target Name',
						type: 'string',
						defaultValue: 'Amber',
					},
					targetRange: {
						type: 'number',
						label: '# < Target',
						ref: 'props.target.b.min',
						defaultValue: '0.8',
					},
					colorProp: {
						component: 'color-picker',
						type: 'object',
						ref: 'props.target.b.color',
						defaultValue: { color: '#ffcb54', index: '-1' },
					},
				},
			},
			groupC: {
				// Group C is always min Zero
				type: 'items',
				show: function (e) {
					if (e.props.target.show === true) {
						return true;
					}
					return false;
				},
				items: {
					StringProp: {
						ref: 'props.target.c.title',
						label: 'Target Name',
						type: 'string',
						defaultValue: 'Red',
					},
					colorProp: {
						component: 'color-picker',
						type: 'object',
						ref: 'props.target.c.color',
						defaultValue: { color: '#75cc40', index: '-1' },
					},
				},
			},
			groupStroke: {
				type: 'items',
				show: function (e) {
					if (e.props.target.show === true) {
						return true;
					}
					return false;
				},
				items: {
					strokeWidth: {
						ref: 'props.target.stroke.width',
						label: 'Stroke Properties',
						type: 'number',
						component: 'slider',
						min: 0.1,
						max: 3,
						step: 0.2,
						defaultValue: 1,
					},
					colorProp: {
						component: 'color-picker',
						type: 'object',
						ref: 'props.target.stroke.color',
						defaultValue: { color: '#ffffff', index: '-1' },
					},
				},
			},
		},
	};

	// Appearance section
	const appearanceSection = {
		uses: 'settings',
		items: {
			targetProps: targetProps,
			groupProps: groupProps,
			markProps: markProps,
		},
	};

	// *****************************************************************************
	// Further sections
	// *****************************************************************************

	// const helpText = {
	// 	label: "Help",
	// 	type: "items",
	// 	items: {
	// 		text: {
	// 			label: "Two measures are required:",
	// 			component: "text",
	// 			type: "string"
	// 		},
	// 		text1: {
	// 			label: "1. Numerator (Active)",
	// 			component: "text",
	// 			type: "string"
	// 		},
	// 		text2: {
	// 			label: "2.Denominator (Remainder are Inactive)",
	// 			component: "text",
	// 			type: "string"
	// 		},
	// 		text3: {
	// 			label: "More details can be found in 'readme.md' file.",
	// 			component: "text",
	// 			type: "string"
	// 		}
	// 	}
	// }

	const aboutText = {
		label: 'About',
		type: 'items',
		items: {
			chartText: {
				label: 'Sense Target Chart v1.0.0',
				component: 'text',
				type: 'string',
			},
			authorText: {
				label: 'Richard Pearce',
				component: 'text',
				type: 'string',
			},
			debug: {
				label: 'Debug',
				ref: 'props.debug',
				component: 'switch',
				type: 'boolean',
				defaultValue: false,
				options: [
					{
						value: true,
						label: 'Debug',
					},
					{
						value: false,
						label: 'No Logging',
					},
				],
			},
		},
	};

	// *****************************************************************************
	// Main properties panel definition
	// Only what is defined here is returned from properties.js
	// *****************************************************************************
	return {
		type: 'items',
		component: 'accordion',
		items: {
			dimensions: dimensions,
			measures: measures,
			sorting: sorting,
			appearanceSection: appearanceSection,
			aboutText: aboutText,
			//helpText: helpText
		},
	};
});
