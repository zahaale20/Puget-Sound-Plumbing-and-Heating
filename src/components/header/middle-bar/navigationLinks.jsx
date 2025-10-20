export const navLinks = [
	{ 
		name: "Services", 
		href: "/services",
		submenu: [
			{
				name: "Plumbing",
				href: "/services/plumbing",
				submenu: [
					{ name: "Emergency Plumbing", href: "/services/plumbing/emergency" },
					{ name: "Plumbing Repairs", href: "/services/plumbing/repairs" },
					{ name: "Faucet", href: "/services/plumbing/faucet" },
					{ name: "Toilet", href: "/services/plumbing/toilet" },
					{ name: "Garbage Disposal", href: "/services/plumbing/disposal" },
					{ name: "Water Filtration Systems", href: "/services/plumbing/filtration" },
					{ name: "Gas Line Services", href: "/services/plumbing/gas" },
					{ name: "Leak Detection", href: "/services/plumbing/leak" },
					{ name: "Water Services Repair & Install", href: "/services/plumbing/water-services" },
				],
			},
			{
				name: "Drain & Sewer",
				href: "/services/drain-and-sewer",
				submenu: [
					{ name: "Drain Cleaning", href: "/services/drain-and-sewer/cleaning" },
					{ name: "Sewer Inspection", href: "/services/drain-and-sewer/inspection" },
					{ name: "Sewer Repair & Install", href: "/services/drain-and-sewer/repair" },
					{ name: "Hydro Jetting", href: "/services/drain-and-sewer/hydrojetting" },
					{ name: "No Dig & Trenchless", href: "/services/drain-and-sewer/trenchless" },
					{ name: "Sewer & Drain Pump", href: "/services/drain-and-sewer/pump" },
				],
			},
			{
				name: "Water Heaters",
				href: "/services/water-heaters",
				submenu: [
					{ name: "Tankless Water Heaters", href: "/services/water-heaters/tankless" },
					{ name: "Gas Water Heaters", href: "/services/water-heaters/gas" },
					{ name: "Electric Water Heaters", href: "/services/water-heaters/electric" },
				],
			},
			{
				name: "Heating & Cooling",
				href: "/services/heating-and-cooling",
				submenu: [
					{ name: "Furnace Install & Repair", href: "/services/heating-and-cooling/furnace" },
					{ name: "Boiler Install & Repair", href: "/services/heating-and-cooling/boiler" },
					{ name: "Air Conditioning", href: "/services/heating-and-cooling/ac" },
				],
			}
		]
	},
	{ 
		name: "Resources", 
		href: "/resources",
		submenu: [
			{
				name: "Resources",
				href: "/resources",
				submenu: [
					{ name: "DIY - Plumbing Permit", href: "/resources/plumbing-permit"},
					{ name: "Blog", href: "/resources/blog" },
					{ name: "FAQs", href: "/resources/faq" },
					{ name: "Coupons", href: "/resources/coupons" },
					{ name: "Warranty", href: "/resources/warranty" },
					{ name:"Financing", href: "/resources/financing" }
				]
			}
		]
	},
	{ 
		name: "About Us", 
		href: "/about-us",
		submenu: [
			{
				name: "About Us",
				href: "/about-us",
				submenu: [
					{ name: "Service Areas", href: "/about-us/service-areas" },
					{ name: "Customer Reviews", href: "/about-us/customer-reviews" },
					{ name: "Careers", href: "/about-us/careers" }
				]
			}
		]
	},
];

export const topLinks = [
	{ name: "Careers", href: "/careers" },
	{ name: "Coupons", href: "/coupons" },
	{ name: "Financing", href: "/financing" },
	{ name: "Resources", href: "/resources" },
	{ name: "About Us", href: "/about-us" },
];

export const bottomLinks = [
	{
		name: "Plumbing",
		submenu: [
			{ label: "Emergency Plumbing", href: "/plumbing/emergency" },
			{ label: "Plumbing Repairs", href: "/plumbing/repairs" },
			{ label: "Faucet", href: "/plumbing/faucet" },
			{ label: "Toilet", href: "/plumbing/toilet" },
			{ label: "Garbage Disposal", href: "/plumbing/disposal" },
			{ label: "Water Filtration Systems", href: "/plumbing/filtration" },
			{ label: "Gas Line Services", href: "/plumbing/gas" },
			{ label: "Leak Detection", href: "/plumbing/leak" },
			{ label: "Water Services Repair & Install", href: "/plumbing/water-services" },
		],
	},
	{
		name: "Drain & Sewer",
		submenu: [
			{ label: "Drain Cleaning", href: "/drain/cleaning" },
			{ label: "Sewer Inspection", href: "/drain/inspection" },
			{ label: "Sewer Repair & Install", href: "/drain/repair" },
			{ label: "Hydro Jetting", href: "/drain/hydrojetting" },
			{ label: "No Dig & Trenchless", href: "/drain/trenchless" },
			{ label: "Sewer & Drain Pump", href: "/drain/pump" },
		],
	},
	{
		name: "Water Heaters",
		submenu: [
			{ label: "Tankless Water Heaters", href: "/heaters/tankless" },
			{ label: "Gas Water Heaters", href: "/heaters/gas" },
			{ label: "Electric Water Heaters", href: "/heaters/electric" },
		],
	},
	{
		name: "Heating & Cooling",
		submenu: [
			{ label: "Furnace Install & Repair", href: "/hvac/furnace" },
			{ label: "Boiler Install & Repair", href: "/hvac/boiler" },
			{ label: "Air Conditioning", href: "/hvac/ac" },
		],
	},
];