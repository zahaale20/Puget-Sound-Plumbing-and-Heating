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
          "A burst pipe suddenly flooding your home",
          "A toilet overflowing and causing water damage",
          "A major plumbing leak that will not stop",
          "A water line or gas line issue that requires immediate repair"
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
          "A leaking pipe under the sink or behind the wall",
          "Low water pressure in showers or faucets",
          "Strange noises coming from pipes when water runs",
          "Water spots on ceilings or walls caused by hidden leaks"
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
          "A dripping faucet that will not stop running",
          "A faucet leaking at the base or underneath the sink",
          "Low water pressure coming from kitchen or bathroom faucets",
          "Outdated or damaged fixtures that need replacement"
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
        description: "Keep your toilets functioning properly with expert repair and replacement services. Our Seattle plumbers fix running, clogged, or leaking toilets, restoring reliable flushing performance. We provide careful installations, preventative maintenance, and durable solutions to prevent future leaks, ensuring your bathroom plumbing works efficiently and reliably.",
        problems: [
          "A toilet that keeps running long after flushing",
          "A toilet that keeps clogging over and over",
          "Water leaking around the base of the toilet",
          "A toilet that will not flush properly"
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
        description: "Maintain a smooth-running kitchen with our garbage disposal repair and installation services. From humming or jammed units to leaks and clogs, our Seattle plumbers ensure your disposal operates safely and efficiently. We install modern, reliable units and provide solutions that prevent future jams, keeping your kitchen drains clear and your home functioning seamlessly.",
        problems: [
          "A garbage disposal that is humming but not spinning",
          "A disposal unit leaking under the sink",
          "A disposal clogged with food waste",
          "A broken disposal causing kitchen drain backups"
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
        description: "Improve your home’s water quality with professional water filtration system installation. Our Seattle team designs, installs, and maintains filtration systems that remove contaminants, reduce hard water buildup, and enhance taste. With our solutions, homeowners enjoy cleaner, healthier water and appliances protected from mineral damage while supporting overall home plumbing health.",
        problems: [
          "Tap water that tastes strange or smells unpleasant",
          "Hard water leaving mineral buildup on fixtures",
          "Concerns about drinking water quality at home",
          "Scale buildup damaging plumbing and appliances"
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
        description: "Ensure your home’s gas lines are safe and fully compliant with our professional gas line services. We handle installation, repair, and leak detection for appliances, stoves, dryers, and heating systems. Our Seattle-based team prioritizes safety and precision, providing secure connections and peace of mind for homeowners.",
        problems: [
          "Suspected gas leaks around appliances or gas lines",
          "Installing a gas stove, dryer, or outdoor grill",
          "Old gas piping that needs to be replaced",
          "Gas line issues affecting home heating systems"
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
        description: "Protect your home with professional leak detection services. Our Seattle plumbers use advanced tools to locate hidden water leaks behind walls, under foundations, and in other inaccessible areas. Prompt detection and accurate diagnosis allow us to provide effective repairs, minimizing damage and ensuring your plumbing system remains reliable and secure.",
        problems: [
          "A sudden spike in your water bill with no explanation",
          "Damp spots appearing on walls, floors, or ceilings",
          "The sound of running water when no fixtures are on",
          "Hidden plumbing leaks behind walls or under foundations"
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
        description: "Maintain steady water pressure and a consistent supply with our water service repair and installation solutions. Our Seattle team handles main line repairs, pipe replacements, and upgrades to ensure long-term functionality. We provide durable, high-quality underground solutions that restore reliable water flow for homeowners and protect the integrity of your plumbing system.",
        problems: [
          "Low water pressure throughout the entire home",
          "A damaged main water line supplying the house",
          "Old water service pipes that need replacement",
          "Frequent water supply interruptions"
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
        description: "Keep your home flowing smoothly with our professional drain cleaning services. We remove blockages, hair, grease, and debris from sinks, tubs, and main lines to prevent backups and maintain optimal water flow. Our Seattle team ensures every drain is cleared efficiently, minimizing inconvenience and protecting your plumbing system from future clogs.",
        problems: [
          "Slow draining sinks, tubs, or showers",
          "Backed-up kitchen or bathroom drains",
          "Foul odors coming from drains",
          "Recurring drain clogs despite DIY attempts"
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
        description: "Identify and resolve sewer issues before they become major problems with our advanced sewer inspection services. Using cameras and diagnostic tools, our Seattle experts pinpoint blockages, cracks, or tree root intrusions. Accurate inspections allow us to recommend precise solutions, protecting your home from costly damage and ensuring your sewer system functions reliably.",
        problems: [
          "Frequent backups in sinks, tubs, or toilets",
          "Unexplained foul odors in plumbing",
          "Potential tree root intrusion or pipe damage",
          "Suspected blockages in main sewer lines"
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
        description: "Maintain a reliable sewer system with our professional repair and installation services. From broken pipes to full line replacements, our Seattle team provides durable, code-compliant solutions. We minimize disruption and restore proper sewer function, protecting your home from water damage and ensuring efficient wastewater management.",
        problems: [
          "Collapsed or broken sewer lines",
          "Persistent backups or flooding",
          "Old or deteriorating pipes needing replacement",
          "Sewer line damage caused by roots or shifting soil"
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
        description: "Clear tough blockages and buildup with our hydro jetting services. Using high-pressure water jets, our Seattle plumbers remove grease, scale, and debris from sewer and drain lines, restoring optimal flow. Hydro jetting is safe, efficient, and prevents future clogs, ensuring your plumbing system operates smoothly and reliably.",
        problems: [
          "Severe grease or sludge buildup in pipes",
          "Recurring clogs resistant to traditional snaking",
          "Slow draining sinks or tubs",
          "Potential damage from accumulated debris in main lines"
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
        description: "Repair or replace sewer and drain lines without costly digging using our trenchless technology. Our Seattle team installs durable pipe liners and performs precise repairs underground, preserving landscaping and reducing disruption. Trenchless methods are fast, effective, and extend the lifespan of your plumbing system while minimizing inconvenience.",
        problems: [
          "A broken sewer line needing replacement",
          "Damaged or leaking underground pipes",
          "Avoiding damage to landscaping or hardscapes",
          "High cost of traditional excavation methods"
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
        description: "Ensure proper wastewater management with our sewer and drain pump services. Our Seattle experts install, repair, and maintain pumps for basements, low-lying areas, and commercial properties. We provide reliable pumping solutions to prevent flooding, backups, and water damage, keeping your property safe and functional.",
        problems: [
          "Basement flooding due to insufficient drainage",
          "Malfunctioning sump or sewage pumps",
          "Low-lying areas prone to water accumulation",
          "Potential property damage from backed-up water"
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
        description: "Upgrade to efficient, on-demand hot water with our tankless water heater installation and repair services. Our Seattle experts provide energy-efficient solutions that deliver continuous hot water, save space, and reduce utility costs. We ensure precise installation and maintenance for long-lasting, reliable performance.",
        problems: [
          "Inconsistent hot water supply",
          "High energy bills from traditional water heaters",
          "Limited space for bulky tank units",
          "Old water heater needing replacement"
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
        description: "Our gas water heater services provide fast, reliable hot water for your home. We install, repair, and maintain gas water heaters to ensure safe operation, consistent performance, and energy efficiency. Our Seattle team prioritizes safety and compliance with local codes, delivering long-lasting solutions for your household water needs.",
        problems: [
          "Insufficient hot water",
          "Gas leaks or unsafe operation",
          "Old, inefficient water heaters",
          "Frequent breakdowns requiring repair"
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
        description: "Enjoy dependable hot water with our electric water heater installation and repair services. Our Seattle team ensures efficient, safe, and long-lasting electric water heaters, providing energy savings and reliable performance. We handle everything from diagnostics and repair to complete installations, ensuring your water heating needs are met.",
        problems: [
          "Inconsistent or insufficient hot water",
          "Old electric water heater needing replacement",
          "Frequent breakdowns or leaks",
          "High electricity usage from inefficient units"
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
        description: "Stay warm during Seattle winters with our professional furnace installation and repair services. We service all types of furnaces, ensuring safe, efficient, and reliable heating. Our team provides diagnostics, repairs, and installations with long-lasting performance to keep your home comfortable year-round.",
        problems: [
          "Furnace not heating properly",
          "Frequent breakdowns or inefficiency",
          "Old or outdated furnace needing replacement",
          "Strange noises or odors from furnace"
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
        description: "Ensure consistent, efficient heating with our boiler installation and repair services. Our Seattle team provides maintenance, repair, and new installations for all boiler systems, ensuring safe operation and optimal performance. We deliver durable solutions that keep your home or business warm and energy-efficient.",
        problems: [
          "Boiler not heating water effectively",
          "Leaks or corrosion in boiler system",
          "Inefficient or outdated boilers",
          "Frequent maintenance or repair needs"
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
        description: "Beat Seattle summers with professional air conditioning installation, repair, and maintenance. Our team ensures efficient cooling, improved air quality, and reliable operation for homes and businesses. We provide expert diagnostics, installations, and repairs to maintain comfort and optimize energy efficiency throughout the year.",
        problems: [
          "AC not cooling effectively",
          "Frequent breakdowns or leaks",
          "Old or inefficient air conditioning units",
          "Poor indoor air quality or inconsistent temperature"
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
