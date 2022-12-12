define( [], function () {
	'use strict';
	
	// *****************************************************************************
	// Dimensions & Measures
	// *****************************************************************************	
	const dimensions = {
		uses: "dimensions",
		min: 0,
		max: 4,
	};
	const measures = {
		uses: "measures",
		min: 0,
		max: 4,
	};
	const sorting = {
		uses: "sorting"
	};


	// Appearance section
	// const appearanceSection = {
	// 	uses: "settings",
	// 	items: {
	// 		propIcon: propIcon	
	// 	}
	// };



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
		label: "About",
		type: "items",
		items: {
			chartText: {
				label: "Sense Target Chart v1.0.0",
				component: "text",
				type: "string"
			},
			authorText: {
				label: "Richard Pearce",
				component: "text",
				type: "string"
			},
			debug :{
				label: "Debug",
				ref:"props.debug",
				component:"switch",
				type: "boolean",
				defaultValue: true,
				options: [{
					value: true,
					label: "Debug"
				},{
					value: false,
					label: "No Logging"
				}]
			}
		}
	}

	
	// *****************************************************************************
	// Main properties panel definition
	// Only what is defined here is returned from properties.js
	// *****************************************************************************
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: dimensions,
			measures: measures,
			//KPIMessage: KPIMessage,
			sorting: sorting,
			//appearanceSection: appearanceSection,
			aboutText: aboutText
			//helpText: helpText
		}
	};
});

