import emergencyPlumbing from "../../assets/plumbing-emergency-plumbing.png";
import plumbingRepairs from "../../assets/plumbing-plumbing-repairs.png";
import faucets from "../../assets/plumbing-faucets.png";
import toilets from "../../assets/plumbing-toilets.png";
import garbageDisposal from "../../assets/plumbing-garbage-disposal.png";
import waterFiltrationSystems from "../../assets/plumbing-water-filtration-systems.png";
import gasLineServices from "../../assets/plumbing-gas-line-services.png";
import leakDetection from "../../assets/plumbing-leak-detection.png";
import waterServicesRepairAndInstall from "../../assets/plumbing-water-services-repair-and-install.png";

import drainCleaning from "../../assets/drain-and-sewer-drain-cleaning.png";
import hydroJetting from "../../assets/drain-and-sewer-hydro-jetting.png";
import noDigAndTrenchless from "../../assets/drain-and-sewer-no-dig-and-trenchless.png";
import sewerInspection from "../../assets/drain-and-sewer-sewer-inspection.png";
import sewerRepairAndInstall from "../../assets/drain-and-sewer-sewer-repair-and-install.png";
import sewerAndDrainPump from "../../assets/drain-and-sewer-sewer-and-drain-pump.png";

import tanklessWaterHeaters from "../../assets/water-heaters-tankless-water-heaters.png";
import electricWaterHeaters from "../../assets/water-heaters-electric-water-heaters.png";
import gasWaterHeaters from "../../assets/water-heaters-gas-water-heaters.png";

import airConditioning from "../../assets/heating-and-cooling-air-conditioning.png";
import boilerInstallAndRepair from "../../assets/heating-and-cooling-boiler-install-and-repair.png";
import furnaceInstallAndRepair from "../../assets/heating-and-cooling-furnace-install-and-repair.png";

export const CompanyLinks = [
	{
		name: "Blog", 
		href: "/blog"
	},
	{
		name: "Careers", 
		href: "/careers"
	},
	{ 
		name: "Coupons",
		href: "/coupons"
	},
	{
		name: "Resources",
		href: "/resources"
	},
	{
		name: "About Us",
		href: "/about-us"
	}
]

export const ServiceLinks = [
  {
    name: "Plumbing",
    href: "/services/plumbing",
    submenu: [
      {
        name: "Emergency Plumbing",
        href: "/services/plumbing/emergency",
        image: emergencyPlumbing,
        description: "When plumbing emergencies strike, our Seattle-based emergency plumbing services provide fast, reliable solutions. From burst pipes and overflowing toilets to major leaks, our experienced technicians respond quickly to prevent water damage and restore your home’s plumbing system. We combine advanced tools with expert knowledge to ensure every emergency is handled safely and efficiently, giving homeowners peace of mind when they need it most.",
        problems: [
          "A burst pipe is flooding your home",
          "Your toilet is overflowing uncontrollably",
          "A major pipe leak has started and won't stop",
          "You smell gas or 'rotten eggs' near an appliance",
          "Sewage is backing up into your bathtub or drains",
          "Your basement is flooding from a sump pump failure",
          "A critical water line requires immediate shut-off"
        ],
        guarantees: [
          "Fast emergency plumbing response in the Seattle area",
          "Experienced technicians who diagnose the problem quickly",
          "Reliable repairs that prevent further water damage",
          "Clear explanations and honest repair recommendations"
        ]
      },
      {
        name: "Plumbing Repairs",
        href: "/services/plumbing/repairs",
        image: plumbingRepairs,
        description: "Our professional plumbing repair services in Seattle ensure your pipes and fixtures work efficiently and reliably. We handle leaky pipes, low water pressure, noisy plumbing, and hidden water damage, providing accurate diagnostics and long-lasting solutions. Our team prioritizes transparent pricing and quality workmanship to deliver dependable repairs that maintain your home’s plumbing integrity and protect your investment.",
        problems: [
          "A pipe is leaking under the sink or behind a wall",
          "Water pressure in the shower is suddenly low",
          "Pipes are making loud banging or rattling noises",
          "Mystery water spots are appearing on ceilings or walls",
          "Old pipes are showing signs of rust or corrosion",
          "A shut-off valve is stuck or leaking",
          "Tap water looks brown, rusty, or discolored"
        ],
        guarantees: [
          "Accurate troubleshooting of plumbing problems",
          "Professional pipe and fixture repairs",
          "Durable solutions designed to last",
          "Transparent pricing before any work begins"
        ]
      },
      {
        name: "Faucets",
        href: "/services/plumbing/faucets",
        image: faucets,
        description: "Enhance your home’s water efficiency with our faucet repair and installation services. Our Seattle plumbing team fixes dripping faucets, low-pressure fixtures, and outdated designs while offering high-quality replacements. Each installation is performed with attention to detail, ensuring optimal water flow, durability, and aesthetic appeal for your kitchen and bathroom faucets.",
        problems: [
          "A dripping faucet is wasting water and won't stop",
          "Water is leaking from the handle or under the sink",
          "The pull-out spray head has low flow or is broken",
          "You need a professional to install a new fixture",
          "The faucet handle is loose, stiff, or hard to turn",
          "Your bathtub faucet is leaking or spraying erratically",
          "A clogged aerator is causing poor water flow"
        ],
        guarantees: [
          "Professional faucet repair and installation",
          "High quality fixture replacement options",
          "Improved water flow and efficiency",
          "Clean installation with attention to detail"
        ]
      },
      {
        name: "Toilets",
        href: "/services/plumbing/toilets",
        image: toilets,
        description: "Keep your toilets functioning properly with expert repair and replacement services. We specialize in troubleshooting running toilets, clearing stubborn clogs, and installing modern, high-efficiency models. Our technicians ensure every unit is securely mounted and leak-free, providing reliable performance and helping you reduce unnecessary water waste in your home.",
        problems: [
          "Your toilet keeps running long after flushing",
          "The toilet is constantly clogging or backing up",
          "Water is pooling around the base of the toilet",
          "The flush is weak or the tank isn't filling",
          "A crack in the porcelain tank or bowl is leaking",
          "The toilet is wobbly and needs a new wax ring",
          "You hear 'ghost flushes' or hissing from the tank"
        ],
        guarantees: [
          "Complete toilet repair and troubleshooting",
          "Professional toilet replacement when needed",
          "Reliable flushing performance restored",
          "Careful installation to prevent future leaks"
        ]
      },
      {
        name: "Garbage Disposal",
        href: "/services/plumbing/disposal",
        image: garbageDisposal,
        description: "Maintain a smooth-running kitchen with our professional garbage disposal repair and installation services. Whether your unit is jammed, leaking, or making unusual noises, our team can quickly diagnose the issue and restore function. We provide high-quality replacement units that offer quiet operation and powerful grinding capabilities, ensuring your kitchen cleanup remains hassle-free.",
        problems: [
          "The disposal is humming but the blades won't spin",
          "Water is leaking from the bottom of the unit",
          "The kitchen sink is backed up from a disposal jam",
          "A foul, rotting smell is coming from the drain",
          "The unit won't turn on or keeps tripping the reset",
          "You hear loud metal grinding during operation",
          "You need to upgrade to a quiet, high-power unit"
        ],
        guarantees: [
          "Safe garbage disposal repair and replacement",
          "Professional installation of modern disposal units",
          "Restored kitchen drain performance",
          "Solutions designed to prevent future jams"
        ]
      },
      {
        name: "Water Filtration Systems",
        href: "/services/plumbing/filtration",
        image: waterFiltrationSystems,
        description: "Improve your home’s water quality with professional water filtration system installation tailored for Seattle's specific water conditions. We offer whole-home solutions that remove chlorine, sediment, and heavy metals, protecting your family’s health and extending the life of your appliances. Our team helps you select and maintain the perfect system to ensure clean, great-tasting water from every tap.",
        problems: [
          "Tap water tastes strange or smells like chlorine",
          "Hard water is leaving white scale on your faucets",
          "You're concerned about lead or contaminants",
          "Mineral buildup is damaging your appliances",
          "Your laundry is stained or your skin feels dry",
          "A clogged filter is reducing your water pressure",
          "You need a filtration plan tailored for Seattle water"
        ],
        guarantees: [
          "Professional whole home water filtration installation",
          "Cleaner, better tasting drinking water",
          "Reduced mineral buildup in pipes and appliances",
          "Solutions tailored to Seattle area water conditions"
        ]
      },
      {
        name: "Gas Line Services",
        href: "/services/plumbing/gas",
        image: gasLineServices,
        description: "Ensure your home’s gas lines are safe and fully compliant with our professional gas line services. We specialize in leak detection, line repairs, and new installations for stoves, dryers, and outdoor appliances. Our licensed technicians prioritize safety above all else, providing secure connections and emergency shut-off solutions to protect your property and family from potential hazards.",
        problems: [
          "You smell gas near your stove, furnace, or dryer",
          "You need a gas line for a new range, BBQ, or fire pit",
          "Old gas pipes are corroded and need replacement",
          "Your gas water heater or furnace won't ignite",
          "You need to relocate gas lines for a home remodel",
          "You want to install a safety earthquake shut-off valve",
          "Low gas pressure is affecting appliance performance"
        ],
        guarantees: [
          "Safe and code compliant gas line installation",
          "Professional gas leak detection and repair",
          "Secure connections for appliances and heating systems",
          "Experienced technicians trained in gas safety"
        ]
      },
      {
        name: "Leak Detection",
        href: "/services/plumbing/leak",
        image: leakDetection,
        description: "Protect your home from the devastating effects of water damage with our professional leak detection services. Using advanced thermal imaging and acoustic tools, we locate hidden leaks behind walls, under foundations, and within your main water lines. Our non-invasive techniques allow us to find the source of the problem quickly, saving you money on repairs and preventing long-term structural issues.",
        problems: [
          "Your water bill has spiked for no obvious reason",
          "You hear running water but no faucets are on",
          "Damp spots or soft areas are appearing on floors",
          "You suspect a slab leak under your foundation",
          "A musty odor won't go away in the bathroom",
          "Paint is bubbling or wallpaper is peeling from leaks",
          "You need thermal imaging to find a hidden leak"
        ],
        guarantees: [
          "Advanced leak detection tools and techniques",
          "Fast identification of hidden water leaks",
          "Minimal disruption during the inspection process",
          "Reliable repair recommendations"
        ]
      },
      {
        name: "Water Services Repair and Install",
        href: "/services/plumbing/water-services",
        image: waterServicesRepairAndInstall,
        description: "Maintain steady water pressure and a consistent supply with our comprehensive water service solutions. We handle everything from main line repairs in your yard to replacing outdated lead and galvanized service pipes. Our team ensures your home’s connection to the municipal supply is robust, code-compliant, and optimized for maximum flow and long-term reliability.",
        problems: [
          "The house has low water pressure that won't go away",
          "The main water line in your yard is broken or leaking",
          "Old lead or galvanized service pipes need replacement",
          "Water is pooling in your yard near the street or meter",
          "Your main shut-off valve is stuck or leaking",
          "You have frequent supply interruptions or sediment",
          "You need to upgrade underground lines for better flow"
        ],
        guarantees: [
          "Professional water line repair and replacement",
          "Restored water pressure and consistent supply",
          "Long lasting underground pipe solutions",
          "Reliable service for Seattle homeowners"
        ]
      }
    ]
  },
  {
    name: "Drain and Sewer",
    href: "/services/drain-and-sewer",
    submenu: [
      {
        name: "Drain Cleaning",
        href: "/services/drain-and-sewer/cleaning",
        image: drainCleaning,
        description: "Keep your home flowing smoothly with our professional drain cleaning services. We use safe and effective methods to clear clogs in sinks, tubs, and showers, removing buildup that causes slow drainage and foul odors. Our technicians provide deep cleaning that goes beyond a simple plunge, restoring full flow to your plumbing system and helping to prevent future blockages before they start.",
        problems: [
          "Sinks, tubs, or showers are draining painfully slow",
          "The kitchen sink is backed up and won't clear",
          "Foul or 'rotten egg' odors are coming from drains",
          "Recurring clogs keep coming back every few weeks",
          "Pipes gurgle loudly when you flush the toilet",
          "Drain flies are appearing around your fixtures",
          "Multiple drains are backing up at the same time"
        ],
        guarantees: [
          "Thorough drain cleaning for all household drains",
          "Fast, reliable, and efficient service",
          "Prevention of future clogs with expert advice",
          "Safe methods that protect your pipes and plumbing"
        ]
      },
      {
        name: "Sewer Inspection",
        href: "/services/drain-and-sewer/inspection",
        image: sewerInspection,
        description: "Identify and resolve sewer issues before they become major disasters with our advanced camera inspections. We provide high-definition video scopes that allow us to see exactly what is happening inside your underground pipes, from tree root intrusion to structural cracks. This detailed reporting is essential for home buyers and homeowners looking for an accurate diagnosis without the need for initial digging.",
        problems: [
          "You're buying a home and need a sewer scope",
          "The main line is backing up from tree root intrusion",
          "You have persistent sewage backups and don't know why",
          "You smell sewer gas inside your home or basement",
          "The lawn above your sewer line is soggy or sinking",
          "You need to check the condition of old clay pipes",
          "Floor drains are gurgling or overflowing with waste"
        ],
        guarantees: [
          "Advanced camera inspection for accurate diagnosis",
          "Detailed reporting of sewer conditions",
          "Targeted solutions to prevent future problems",
          "Minimized disruption during inspection"
        ]
      },
      {
        name: "Sewer Repair and Install",
        href: "/services/drain-and-sewer/repair",
        image: sewerRepairAndInstall,
        description: "Maintain a reliable waste management system with our professional sewer repair and installation services. Whether you are dealing with a collapsed line, root damage, or the need for a new installation for a home addition, our team provides durable, code-compliant solutions. We utilize both traditional and modern techniques to ensure your sewer system is restored to peak performance with as little disruption as possible.",
        problems: [
          "A collapsed sewer line is causing a total blockage",
          "A broken sewer pipe under your driveway needs repair",
          "Tree roots have crushed your underground pipes",
          "You need a sewer line for an ADU or home addition",
          "Old pipes are deteriorating and need an upgrade",
          "Basement flooding is linked to a sewer failure",
          "A bellied pipe is collecting debris and clogging"
        ],
        guarantees: [
          "Durable, code-compliant sewer repairs",
          "Professional installation of new sewer lines",
          "Fast restoration of proper function",
          "Long-lasting solutions to prevent future issues"
        ]
      },
      {
        name: "Hydro Jetting",
        href: "/services/drain-and-sewer/hydrojetting",
        image: hydroJetting,
        description: "Clear the toughest blockages and heavy buildup with our high-pressure hydro jetting services. This advanced technique uses concentrated water streams to scour the inside of your pipes, removing grease, scale, and stubborn tree roots that traditional snaking can't touch. It is the ultimate solution for restoring your sewer and drain lines to like-new condition, ensuring long-term flow and preventing future backups.",
        problems: [
          "Severe grease or sludge is choking your kitchen lines",
          "Traditional snaking isn't clearing recurring clogs",
          "Hard mineral scale has built up inside cast iron pipes",
          "You need to clear stubborn roots without digging",
          "Storm drains or perimeter drains are full of debris",
          "You want to restore pipes to 'like-new' flow capacity",
          "The sewer line is sluggish due to years of buildup"
        ],
        guarantees: [
          "High-pressure cleaning to remove tough blockages",
          "Safe and efficient hydro jetting techniques",
          "Prevention of future clogs",
          "Professional service with minimal disruption"
        ]
      },
      {
        name: "No Dig and Trenchless",
        href: "/services/drain-and-sewer/trenchless",
        image: noDigAndTrenchless,
        description: "Repair or replace your sewer lines without the need for costly and destructive digging. Our trenchless technology allows us to reline or burst old pipes from small access points, preserving your landscaping, driveway, and mature trees. These modern 'no-dig' solutions offer the same durability as traditional methods but with significantly less mess and faster completion times for Seattle homeowners.",
        problems: [
          "You need a sewer fix without ruining landscaping",
          "A pipe is broken under your driveway or patio",
          "You want to avoid the mess of yard excavation",
          "Underground pipes are leaking but hard to reach",
          "You need to fix a sewer line under mature trees",
          "You're looking for a fast, non-invasive repair",
          "You need to reline failing cast iron sewer pipes"
        ],
        guarantees: [
          "Non-invasive trenchless repair solutions",
          "Minimal disruption to property and landscaping",
          "Durable repairs with long-term reliability",
          "Efficient and cost-effective service"
        ]
      },
      {
        name: "Sewer and Drain Pump",
        href: "/services/drain-and-sewer/pump",
        image: sewerAndDrainPump,
        description: "Ensure proper wastewater management and protect your basement from flooding with our pump installation and repair services. We specialize in sump pumps and sewage ejector systems that keep your home dry and functional, especially in low-lying areas. Our team provides reliable repairs, battery backup installations, and regular maintenance to ensure your pumps are always ready for Seattle’s wettest seasons.",
        problems: [
          "The sump pump won't turn on and the basement is at risk",
          "The sewage pump for your basement bathroom is failing",
          "The pump is making a loud humming or grinding noise",
          "You need a battery backup for power outages",
          "Floor drains are flooding during heavy Seattle rain",
          "The float switch is stuck or the unit is short-cycling",
          "You want to replace an old pump before it fails"
        ],
        guarantees: [
          "Professional installation and repair of pumps",
          "Reliable operation to prevent flooding",
          "Regular maintenance for consistent performance",
          "Expert advice and efficient service"
        ]
      }
    ]
  },
  {
    name: "Water Heaters",
    href: "/services/water-heaters",
    submenu: [
      {
        name: "Tankless Water Heaters",
        href: "/services/water-heaters/tankless",
        image: tanklessWaterHeaters,
        description: "Enjoy endless hot water and improved energy efficiency with a professionally installed tankless water heater. These on-demand systems eliminate the need for a large storage tank, providing hot water only when you need it and saving valuable space in your home. Our team handles everything from new installations and gas line upgrades to annual descaling maintenance, ensuring your system runs perfectly for years to come.",
        problems: [
          "You run out of hot water during back-to-back showers",
          "The tankless unit has an error code and won't ignite",
          "You notice 'cold water sandwiches' or odd temperatures",
          "Energy bills are too high from heating a 50-gallon tank",
          "You need an annual flush to remove mineral scale",
          "The unit is making a loud fan or clicking noise",
          "You want to save space by switching to tankless"
        ],
        guarantees: [
          "Professional tankless water heater installation",
          "Reliable, on-demand hot water performance",
          "Energy-efficient solutions",
          "Long-term service and maintenance"
        ]
      },
      {
        name: "Gas Water Heaters",
        href: "/services/water-heaters/gas",
        image: gasWaterHeaters,
        description: "Our gas water heater services provide fast recovery times and dependable hot water for your entire household. We specialize in the repair and installation of both standard and high-efficiency gas units, addressing common issues like pilot light failure, leaking tanks, and sediment buildup. Our licensed technicians prioritize safe venting and gas connection standards to ensure your home remains comfortable and hazard-free.",
        problems: [
          "The pilot light won't stay lit or won't ignite",
          "The tank is leaking water and flooding the floor",
          "You hear popping or rumbling from sediment buildup",
          "Hot water takes way too long to reach the faucet",
          "You smell gas or suspect a thermocouple failure",
          "Hot water looks rusty or has a metallic smell",
          "The relief valve is constantly dripping or spraying"
        ],
        guarantees: [
          "Safe gas water heater installation and repair",
          "Consistent, reliable hot water supply",
          "Energy-efficient operation",
          "Long-lasting, code-compliant solutions"
        ]
      },
      {
        name: "Electric Water Heaters",
        href: "/services/water-heaters/electric",
        image: electricWaterHeaters,
        description: "Enjoy quiet, dependable hot water with our professional electric water heater services. We handle heating element replacements, thermostat repairs, and complete system upgrades, including modern heat pump hybrid models. Our team ensures your electric water heater is optimized for performance and safety, providing a consistent supply of hot water while helping you manage your home’s energy consumption effectively.",
        problems: [
          "Water is lukewarm or cold even with the power on",
          "The heater keeps tripping the circuit breaker",
          "You need to replace a burnt-out heating element",
          "The tank is old and leaking from the base",
          "You hear a loud hissing or sizzling from the tank",
          "You want to upgrade to a high-efficiency heat pump",
          "Hot water runs out much faster than it used to"
        ],
        guarantees: [
          "Professional electric water heater installation and repair",
          "Reliable and efficient hot water performance",
          "Energy-efficient solutions",
          "Durable, long-lasting service"
        ]
      }
    ]
  },
  {
    name: "Heating and Cooling",
    href: "/services/heating-and-cooling",
    submenu: [
      {
        name: "Furnace Install and Repair",
        href: "/services/heating-and-cooling/furnace",
        image: furnaceInstallAndRepair,
        description: "Stay warm and comfortable during Seattle's coldest months with our expert furnace installation and repair services. We work with gas and electric furnaces, providing thorough diagnostics to fix issues like cold airflow, short-cycling, and unusual noises. Our team also specializes in installing high-efficiency heating systems that provide consistent warmth throughout your home while reducing your monthly utility costs.",
        problems: [
          "The furnace is blowing cold air or won't turn on",
          "The system is turning on and off too frequently",
          "You hear loud screeching, banging, or rattling",
          "Heating bills have spiked despite normal usage",
          "The ignitor is clicking but the burners won't light",
          "The air feels incredibly dry or full of dust",
          "The thermostat isn't communicating with the unit"
        ],
        guarantees: [
          "Professional furnace installation and repair",
          "Reliable and efficient heating performance",
          "Long-lasting solutions for all furnace types",
          "Safety and code compliance"
        ]
      },
      {
        name: "Boiler Install and Repair",
        href: "/services/heating-and-cooling/boiler",
        image: boilerInstallAndRepair,
        description: "Ensure your home’s radiant or hydronic heating system is operating at peak efficiency with our professional boiler services. We specialize in troubleshooting uneven heating, pressure loss, and noisy operation for all types of boiler systems. Whether you need a simple repair or a complete upgrade to a modern, high-efficiency combi-boiler, our technicians deliver precise workmanship for long-lasting comfort and reliability.",
        problems: [
          "Radiators are hot in some rooms but cold in others",
          "The boiler is leaking or losing pressure constantly",
          "You hear loud whistling or 'kettling' noises",
          "The boiler is running but the house isn't warming",
          "You need service for radiant floor heating",
          "The boiler keeps locking out and needs resetting",
          "You want to upgrade to a high-efficiency combi-boiler"
        ],
        guarantees: [
          "Expert boiler installation and repair",
          "Reliable and efficient heating performance",
          "Long-lasting, energy-efficient solutions",
          "Safe operation and maintenance"
        ]
      },
      {
        name: "Air Conditioning",
        href: "/services/heating-and-cooling/ac",
        image: airConditioning,
        description: "Beat the heat during Seattle’s warmer summers with professional air conditioning installation and repair services. We offer central AC solutions, ductless mini-split systems, and detailed diagnostics for units that aren't cooling effectively. Our team focuses on improving your home’s air quality and temperature control, providing energy-efficient systems and expert maintenance to keep your family cool and comfortable all season long.",
        problems: [
          "The AC is running but the air isn't cold",
          "The unit is leaking water inside your home",
          "The outside condenser unit is covered in ice",
          "You want to install a ductless mini-split system",
          "The AC makes a loud buzzing or squealing noise",
          "Your home has hot and cold spots the AC can't fix",
          "The system needs a refrigerant recharge or leak fix"
        ],
        guarantees: [
          "Professional AC installation and repair",
          "Reliable and efficient cooling performance",
          "Energy-efficient, long-lasting solutions",
          "Expert maintenance and troubleshooting"
        ]
      }
    ]
  }
];

export const ServiceAreaLinks = [
	{
		name: "Seattle",
		href: "/service-areas/seattle",
		areas: [
			{ name: "Ballard", href: "/service-areas/seattle/ballard" },
			{ name: "Capitol Hill", href: "/service-areas/seattle/capitol-hill" },
			{ name: "Green Lake", href: "/service-areas/seattle/green-lake" },
			{ name: "Wallingford", href: "/service-areas/seattle/wallingford" },
			{ name: "Fremont", href: "/service-areas/seattle/fremont" },
			{ name: "Queen Anne", href: "/service-areas/seattle/queen-anne" },
			{ name: "Magnolia", href: "/service-areas/seattle/magnolia" },
			{ name: "South Lake Union", href: "/service-areas/seattle/south-lake-union" },
			{ name: "West Seattle", href: "/service-areas/seattle/west-seattle" },
			{ name: "Beacon Hill", href: "/service-areas/seattle/beacon-hill" },
			{ name: "Rainier Valley", href: "/service-areas/seattle/rainier-valley" },
			{ name: "University District", href: "/service-areas/seattle/university-district" },
			{ name: "Northgate", href: "/service-areas/seattle/northgate" },
			{ name: "SoDo", href: "/service-areas/seattle/sodo" },
			{ name: "Georgetown", href: "/service-areas/seattle/georgetown" },
			{ name: "Belltown", href: "/service-areas/seattle/belltown" },
			{ name: "Downtown Seattle", href: "/service-areas/seattle/downtown-seattle" }
		]
	},
	{
		name: "King County",
		href: "/service-areas/king-county",
		areas: [
			{ name: "Algona", href: "/service-areas/king-county/algona" },
			{ name: "Auburn", href: "/service-areas/king-county/auburn" },
			{ name: "Beaux Arts Village", href: "/service-areas/king-county/beaux-arts-village" },
			{ name: "Bellevue", href: "/service-areas/king-county/bellevue" },
			{ name: "Black Diamond", href: "/service-areas/king-county/black-diamond" },
			{ name: "Bothell", href: "/service-areas/king-county/bothell" },
			{ name: "Burien", href: "/service-areas/king-county/burien" },
			{ name: "Carnation", href: "/service-areas/king-county/carnation" },
			{ name: "Clyde Hill", href: "/service-areas/king-county/clyde-hill" },
			{ name: "Covington", href: "/service-areas/king-county/covington" },
			{ name: "Des Moines", href: "/service-areas/king-county/des-moines" },
			{ name: "Duvall", href: "/service-areas/king-county/duvall" },
			{ name: "Enumclaw", href: "/service-areas/king-county/enumclaw" },
			{ name: "Federal Way", href: "/service-areas/king-county/federal-way" },
			{ name: "Hunts Point", href: "/service-areas/king-county/hunts-point" },
			{ name: "Issaquah", href: "/service-areas/king-county/issaquah" },
			{ name: "Kenmore", href: "/service-areas/king-county/kenmore" },
			{ name: "Kent", href: "/service-areas/king-county/kent" },
			{ name: "Kirkland", href: "/service-areas/king-county/kirkland" },
			{ name: "Lake Forest Park", href: "/service-areas/king-county/lake-forest-park" },
			{ name: "Maple Valley", href: "/service-areas/king-county/maple-valley" },
			{ name: "Medina", href: "/service-areas/king-county/medina" },
			{ name: "Mercer Island", href: "/service-areas/king-county/mercer-island" },
			{ name: "Milton", href: "/service-areas/king-county/milton" },
			{ name: "Newcastle", href: "/service-areas/king-county/newcastle" },
			{ name: "Normandy Park", href: "/service-areas/king-county/normandy-park" },
			{ name: "North Bend", href: "/service-areas/king-county/north-bend" },
			{ name: "Pacific", href: "/service-areas/king-county/pacific" },
			{ name: "Redmond", href: "/service-areas/king-county/redmond" },
			{ name: "Renton", href: "/service-areas/king-county/renton" },
			{ name: "Sammamish", href: "/service-areas/king-county/sammamish" },
			{ name: "SeaTac", href: "/service-areas/king-county/seatac" },
			{ name: "Seattle", href: "/service-areas/king-county/seattle" },
			{ name: "Shoreline", href: "/service-areas/king-county/shoreline" },
			{ name: "Skykomish", href: "/service-areas/king-county/skykomish" },
			{ name: "Snoqualmie", href: "/service-areas/king-county/snoqualmie" },
			{ name: "Tukwila", href: "/service-areas/king-county/tukwila" },
			{ name: "White Center", href: "/service-areas/king-county/white-center" },
			{ name: "Woodinville", href: "/service-areas/king-county/woodinville" },
			{ name: "Yarrow Point", href: "/service-areas/king-county/yarrow-point" }
		]
	},
	{
		name: "Pierce County",
		href: "/service-areas/pierce-county",
		areas: [
			{ name: "Bonney Lake", href: "/service-areas/pierce-county/bonney-lake" },
			{ name: "Buckley", href: "/service-areas/pierce-county/buckley" },
			{ name: "Carbonado", href: "/service-areas/pierce-county/carbonado" },
			{ name: "DuPont", href: "/service-areas/pierce-county/dupont" },
			{ name: "Eatonville", href: "/service-areas/pierce-county/eatonville" },
			{ name: "Edgewood", href: "/service-areas/pierce-county/edgewood" },
			{ name: "Fife", href: "/service-areas/pierce-county/fife" },
			{ name: "Fircrest", href: "/service-areas/pierce-county/fircrest" },
			{ name: "Frederickson", href: "/service-areas/pierce-county/frederickson" },
			{ name: "Gig Harbor", href: "/service-areas/pierce-county/gig-harbor" },
			{ name: "Graham", href: "/service-areas/pierce-county/graham" },
			{ name: "Lakewood", href: "/service-areas/pierce-county/lakewood" },
			{ name: "Midland", href: "/service-areas/pierce-county/midland" },
			{ name: "Milton", href: "/service-areas/pierce-county/milton" },
			{ name: "Orting", href: "/service-areas/pierce-county/orting" },
			{ name: "Parkland", href: "/service-areas/pierce-county/parkland" },
			{ name: "Pacific", href: "/service-areas/pierce-county/pacific" },
			{ name: "Puyallup", href: "/service-areas/pierce-county/puyallup" },
			{ name: "Roy", href: "/service-areas/pierce-county/roy" },
			{ name: "Ruston", href: "/service-areas/pierce-county/ruston" },
			{ name: "South Hill", href: "/service-areas/pierce-county/south-hill" },
			{ name: "South Prairie", href: "/service-areas/pierce-county/south-prairie" },
			{ name: "Spanaway", href: "/service-areas/pierce-county/spanaway" },
			{ name: "Steilacoom", href: "/service-areas/pierce-county/steilacoom" },
			{ name: "Summit", href: "/service-areas/pierce-county/summit" },
			{ name: "Sumner", href: "/service-areas/pierce-county/sumner" },
			{ name: "Tacoma", href: "/service-areas/pierce-county/tacoma" },
			{ name: "University Place", href: "/service-areas/pierce-county/university-place" },
			{ name: "Wilkeson", href: "/service-areas/pierce-county/wilkeson" }
		]
	},
	{
		name: "Snohomish County",
		href: "/service-areas/snohomish-county",
		areas: [
			{ name: "Arlington", href: "/service-areas/snohomish-county/arlington" },
			{ name: "Bothell", href: "/service-areas/snohomish-county/bothell" },
			{ name: "Brier", href: "/service-areas/snohomish-county/brier" },
			{ name: "Darrington", href: "/service-areas/snohomish-county/darrington" },
			{ name: "Edmonds", href: "/service-areas/snohomish-county/edmonds" },
			{ name: "Everett", href: "/service-areas/snohomish-county/everett" },
			{ name: "Gold Bar", href: "/service-areas/snohomish-county/gold-bar" },
			{ name: "Granite Falls", href: "/service-areas/snohomish-county/granite-falls" },
			{ name: "Lake Stevens", href: "/service-areas/snohomish-county/lake-stevens" },
			{ name: "Lynnwood", href: "/service-areas/snohomish-county/lynnwood" },
			{ name: "Marysville", href: "/service-areas/snohomish-county/marysville" },
			{ name: "Mill Creek", href: "/service-areas/snohomish-county/mill-creek" },
			{ name: "Monroe", href: "/service-areas/snohomish-county/monroe" },
			{ name: "Mountlake Terrace", href: "/service-areas/snohomish-county/mountlake-terrace" },
			{ name: "Mukilteo", href: "/service-areas/snohomish-county/mukilteo" },
			{ name: "Snohomish", href: "/service-areas/snohomish-county/snohomish" },
			{ name: "Stanwood", href: "/service-areas/snohomish-county/stanwood" },
			{ name: "Sultan", href: "/service-areas/snohomish-county/sultan" },
			{ name: "Woodway", href: "/service-areas/snohomish-county/woodway" }
		]
	}
];
