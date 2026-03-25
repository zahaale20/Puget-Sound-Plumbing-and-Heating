import emergencyPlumbing from "../assets/plumbing-emergency-plumbing.png";
import plumbingRepairs from "../assets/plumbing-plumbing-repairs.png";
import faucets from "../assets/plumbing-faucets.png";
import toilets from "../assets/plumbing-toilets.png";
import garbageDisposal from "../assets/plumbing-garbage-disposal.png";
import waterFiltrationSystems from "../assets/plumbing-water-filtration-systems.png";
import gasLineServices from "../assets/plumbing-gas-line-services.png";
import leakDetection from "../assets/plumbing-leak-detection.png";
import waterServicesRepairAndInstall from "../assets/plumbing-water-services-repair-and-install.png";

import drainCleaning from "../assets/drain-and-sewer-drain-cleaning.png";
import hydroJetting from "../assets/drain-and-sewer-hydro-jetting.png";
import noDigAndTrenchless from "../assets/drain-and-sewer-no-dig-and-trenchless.png";
import sewerInspection from "../assets/drain-and-sewer-sewer-inspection.png";
import sewerRepairAndInstall from "../assets/drain-and-sewer-sewer-repair-and-install.png";
import sewerAndDrainPump from "../assets/drain-and-sewer-sewer-and-drain-pump.png";

import tanklessWaterHeaters from "../assets/water-heaters-tankless-water-heaters.png";
import electricWaterHeaters from "../assets/water-heaters-electric-water-heaters.png";
import gasWaterHeaters from "../assets/water-heaters-gas-water-heaters.png";

import airConditioning from "../assets/heating-and-cooling-air-conditioning.png";
import boilerInstallAndRepair from "../assets/heating-and-cooling-boiler-install-and-repair.png";
import furnaceInstallAndRepair from "../assets/heating-and-cooling-furnace-install-and-repair.png";

import waterHeaters from "../assets/blog1.jpg";
import faucetsBlog from "../assets/blog2.jpg";
import toiletRepair from "../assets/blog3.jpg";

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
        prevention: [
          "Locate and clearly label your main water shut-off valve today so every household member can act instantly to stop the flow during a sudden pipe burst.",
          "Install smart water leak detectors near high-risk areas like water heaters and washing machines to receive real-time mobile alerts before a leak becomes a flood.",
          "Inspect exposed pipes in crawl spaces or basements annually for 'pinhole' leaks, green oxidation, or limescale buildup that signals a pending structural failure.",
          "Avoid using caustic chemical drain cleaners as they generate intense heat that weakens pipe walls and joints, making them more prone to sudden ruptures."
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
        prevention: [
          "Monitor your home's water pressure with a simple gauge; maintaining a range between 40-60 PSI prevents 'stress' leaks on your pipe joints and fixtures.",
          "Address minor 'nuisance' drips in faucets or showerheads immediately, as these small leaks are often indicators of underlying pressure issues or failing gaskets.",
          "Replace old rubber washing machine supply hoses with stainless steel braided lines to prevent high-pressure bursts that can flood a home in minutes.",
          "Schedule a professional plumbing audit every two years to check the integrity of shut-off valves and hidden connections behind walls or under floors."
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
        prevention: [
          "Clean and descale your faucet aerators every six months to maintain proper water flow and prevent backpressure that can damage internal cartridges.",
          "Avoid over-tightening faucet handles; applying too much force when turning off the water wears down the rubber washers and ceramic discs prematurely.",
          "Periodically check supply lines under your sinks for signs of moisture or corrosion, ensuring that items stored in the cabinet aren't straining the hoses.",
          "If you have hard water, consider a localized softening solution to prevent mineral deposits from seizing the moving parts of your high-end fixtures."
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
        prevention: [
          "Strictly follow the 'Only 3 Ps' rule (Pee, Poop, and Paper); never flush 'flushable' wipes, facial tissues, or paper towels as they do not dissolve and cause clogs.",
          "Conduct a 'Dye Test' annually by putting food coloring in the tank; if color seeps into the bowl without flushing, your flapper is leaking and wasting water.",
          "Ensure the toilet base remains rock-solid; if the unit wobbles, the wax ring seal can break, leading to hidden subfloor rot and sewage odors.",
          "Avoid using 'drop-in' bleach tablets inside the tank, as the concentrated chemicals corrode the rubber and plastic flush components over time."
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
        prevention: [
          "Always run a strong stream of cold water for 30 seconds after turning off the disposal to ensure all food waste is pushed completely through the P-trap.",
          "Never pour fats, oils, or grease (FOG) down the disposal; these substances solidify in the cold pipes further down the line and create impenetrable blockages.",
          "Avoid fibrous materials like celery, corn husks, and onion skins, which can wrap around the impellers and cause the motor to burn out or jam.",
          "Deodorize and sharpen your unit naturally by grinding ice cubes and citrus peels once a month to break up sludge buildup on the blades."
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
        prevention: [
          "Adhere strictly to the manufacturer’s filter replacement schedule; expired filters can become breeding grounds for bacteria or reduce your home's water pressure.",
          "Monitor the salt levels in your water softener monthly to ensure the ion-exchange process is effectively removing scale-causing minerals from your pipes.",
          "Schedule an annual bypass valve test to ensure you can isolate the filtration system for maintenance without losing water to the rest of the house.",
          "Keep a log of your water’s TDS (Total Dissolved Solids) levels to track the efficiency of your system and identify when the membrane needs professional service."
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
        prevention: [
          "Install carbon monoxide and combustible gas detectors on every floor of your home to provide early warning of silent, odorless leaks.",
          "Periodically inspect visible gas lines for 'weeping' joints or rust, especially in damp areas like basements or near outdoor meter sets.",
          "Never hang clothes or tools from exposed gas piping in the garage or utility room, as the weight can stress the threaded connections and cause leaks.",
          "Schedule a professional gas safety inspection before the winter heating season to ensure all appliance connectors and shut-off valves are code-compliant."
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
        prevention: [
          "Conduct a 'Meter Test' once a quarter: turn off all water in the house and check the meter; if the dial is still moving, you have a hidden leak.",
          "Routinely inspect the 'high-risk zones'—under the kitchen sink, behind the refrigerator's icemaker, and around the base of the water heater.",
          "Watch for bubbling paint, peeling wallpaper, or musty odors, as these are often the first signs of a slow-growth leak hidden behind the drywall.",
          "Clear outdoor gutters and downspouts to ensure water is directed away from the foundation, preventing 'false' leak symptoms in your basement."
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
        prevention: [
          "Be mindful of large landscaping projects; always call for a utility locate before digging to avoid accidentally severing your underground water main.",
          "Protect your main service line from freezing during extreme Seattle cold snaps by ensuring the meter box lid is tightly sealed and insulated.",
          "If you have older galvanized or lead pipes, begin planning a proactive replacement before they become brittle and rupture under the street.",
          "Watch for unusually lush or soggy patches in your lawn during dry weather, which often indicates a slow leak in the underground supply line."
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
        prevention: [
          "Use mesh drain strainers in every tub and shower to catch hair and soap scum before they enter the piping and create stubborn 'clump' clogs.",
          "Flush your kitchen drains weekly with a gallon of boiling water to melt away grease and organic buildup that accumulates on the pipe walls.",
          "Avoid the 'chemical habit'; instead of liquid cleaners, use a mixture of baking soda and vinegar followed by hot water to keep lines fresh and clear.",
          "Never dispose of produce stickers, eggshells, or coffee grounds in the sink, as these do not break down and act as a foundation for clogs."
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
        prevention: [
          "Schedule a proactive sewer scope every 3–5 years, especially if you live in an older Seattle neighborhood with mature trees and clay piping.",
          "Identify the path of your sewer line and avoid planting deep-rooted trees or large shrubs directly over the pipe to prevent root intrusion.",
          "If you experience recurring slow drains in multiple fixtures, get a camera inspection immediately rather than just snaking the lines repeatedly.",
          "Ensure your sewer 'cleanout' cap is visible and accessible in the yard so emergency inspections can be performed without delay."
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
        prevention: [
          "Avoid planting 'willow' or 'poplar' trees near your sewer line, as their aggressive root systems can travel over 100 feet to seek out moisture in your pipes.",
          "Dispose of cooking oils and grease in the trash; when these substances reach the cooler sewer lines, they harden into 'fatbergs' that collapse piping.",
          "Never flush industrial-strength paper or hygiene products, as even a minor pipe offset can catch these materials and lead to a full-line collapse.",
          "Maintain your perimeter drains and gutters to ensure heavy rainwater isn't overwhelming your sewer line and causing internal pressure damage."
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
        prevention: [
          "Schedule a preventative hydro-jetting session every 2 years for kitchen stacks if you do heavy cooking, as grease buildup is inevitable over time.",
          "Avoid using chemical 'degreasers' in your drains; they often just move the grease further down the line where it hardens into a more difficult blockage.",
          "After a hydro-jetting service, use a monthly enzyme-based cleaner to eat away at new organic film before it can solidify into a clog.",
          "Ensure your roof's vent pipes are clear of bird nests or debris, as proper airflow is required for your drains to flow at the high speeds hydro-jetting restores."
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
        prevention: [
          "If you have cast iron sewer pipes older than 40 years, schedule a video inspection to check for 'channeling' (rotting at the bottom) before a total collapse occurs.",
          "Avoid driving heavy machinery or parking large vehicles over the path of your sewer line to prevent 'soil compaction' that can crush older pipes.",
          "Address root intrusion early with enzymatic treatments; once roots grow thick enough to crack the pipe, trenchless relining may no longer be an option.",
          "Ensure your cleanout access is never paved over during driveway renovations so that trenchless equipment can be inserted without demolition."
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
        prevention: [
          "Test your sump pump before the Seattle rainy season begins by pouring a five-gallon bucket of water into the pit to ensure the float switch triggers correctly.",
          "Install a battery-powered backup system; most pump failures occur during heavy storms when power outages are most likely to happen.",
          "Keep the pump pit clear of debris, gravel, and silt, which can clog the intake screen and cause the motor to overheat and burn out.",
          "Replace your pump every 7–10 years regardless of apparent performance, as the mechanical seals and capacitors have a finite lifespan in wet environments."
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
        prevention: [
          "Schedule a professional descaling flush every 12 months to remove calcium buildup that reduces the efficiency of the heat exchanger.",
          "Inspect the air intake and exhaust vents monthly to ensure they are clear of debris, bird nests, or snow that could cause a system lockout.",
          "Ensure your home has a functioning water softener if you have hard water, as mineral scale is the primary cause of premature tankless failure.",
          "Check the internal mesh water filter frequently and rinse away any sediment that could be restricting the flow to the heating elements."
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
        prevention: [
          "Drain and flush your tank annually to remove sediment that acts as an insulator, forcing the burner to run longer and weakening the bottom of the tank.",
          "Test the Temperature and Pressure (T&P) relief valve twice a year by lifting the lever to ensure it releases water and resets properly.",
          "Check the sacrificial anode rod every 3 years; replacing this $30 part can double the lifespan of your tank by preventing internal rust.",
          "Keep the area around the base of the heater clear of combustible materials and ensure the 'vacant' air space is sufficient for proper combustion."
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
        prevention: [
          "Switch off the breaker before performing any maintenance or if you suspect a leak, as water and high-voltage electricity are a deadly combination.",
          "Flush the tank every year to prevent sediment from burying the lower heating element, which causes it to overheat and burn out prematurely.",
          "Check the thermostat settings; keeping the water at 120°F (49°C) prevents scalding and reduces the rate of mineral accumulation on the elements.",
          "Inspect the electrical connection box on top of the heater for signs of singed wires or loose nuts, which can cause the breaker to trip frequently."
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
        prevention: [
          "Change your furnace filters every 1–3 months; a dirty filter restricts airflow, forcing the blower motor to work harder and eventually burn out.",
          "Schedule a professional 'Clean and Check' every autumn to ensure the heat exchanger isn't cracked and the burners are firing safely and efficiently.",
          "Keep all supply and return air vents clear of furniture, curtains, or dust buildup to maintain the balanced static pressure your system requires.",
          "Install a programmable smart thermostat to prevent the system from frequent 'short-cycling,' which adds unnecessary wear to the ignitor and gas valve."
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
        prevention: [
          "Check the pressure gauge regularly; if the pressure consistently drops below 1.0 bar, you likely have a hidden leak in the system that needs immediate repair.",
          "Bleed your radiators once a year to remove trapped air pockets that prevent hot water from circulating and cause the boiler to overwork.",
          "Ensure the condensate pipe is properly insulated during the winter to prevent it from freezing and causing an emergency system shutdown.",
          "Have a magnetic system filter installed to capture 'sludge' and metallic debris before it can clog the delicate heat exchanger in your boiler."
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
        prevention: [
          "Keep the outdoor condenser unit clear of grass clippings, leaves, and debris to ensure the fan can properly dissipate heat from your home.",
          "Flush your AC condensate drain line with a cup of vinegar annually to prevent algae growth from clogging the pipe and flooding your indoor unit.",
          "Avoid turning the thermostat down to 60°F (15°C) in an attempt to cool faster; this often causes the evaporator coils to freeze over and stop cooling entirely.",
          "Schedule a professional refrigerant check and coil cleaning every spring to ensure the system is operating at peak efficiency before the heat arrives."
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

export const categoryOptions = [
    "All",
    "Bathroom Plumbing",
    "Drain Service",
    "Emergency Plumbing",
    "Heating Service",
    "Kitchen Plumbing",
    "Leak Detection",
    "Pipe Repair",
    "Plumbing Basics",
    "Plumbing System",
    "Save Money",
    "Seasonal Plumbing",
    "Sewer Service",
    "Toilet",
    "Uncategorized",
    "Water Heater",
    "Water Quality"
];

export const sortOptions = [
    { name: "Most Recent", value: "dateDesc" },
    { name: "Oldest", value: "dateAsc" },
    { name: "Most Viewed", value: "viewsDesc" },
    { name: "Title (A-Z)", value: "titleAsc" },
  { name: "Title (Z-A)", value: "titleDesc" },
];

export const posts = [
    {
        id: 1,
        title: "Water Heater Repair and Replacement",
        image: waterHeaters,
        author: "John Doe",
        date: "October 10, 2025",
        views: 500,
        link: "/blog/water-heater-installation",
        description: "Expert repair and maintenance for tank and tankless water heaters, ensuring reliable hot water for your home year-round.",
        keywords: ["Water Heater"],
    },
    {
        id: 2,
        title: "Kitchen Faucet Installation Guide",
        image: faucets,
        author: "Jane Smith",
        date: "October 3, 2025",
        views: 5000,
        link: "/blog/faucet-replacement",
        description: "Professional faucet installation and replacement services, improving functionality and aesthetics in kitchens and bathrooms.",
        keywords: ["Kitchen Plumbing"],
    },
    {
        id: 3,
        title: "Toilet Repair and Maintenance Tips",
        image: toiletRepair,
        author: "Jim Bob",
        date: "September 27, 2025",
        views: 999999999,
        link: "/blog/toilet-repair",
        description: "Comprehensive toilet repair and maintenance services to prevent leaks, clogs, and ensure long-lasting performance.",
        keywords: ["Toilet"],
    },
    {
        id: 4,
        title: "Emergency Water Heater Services",
        image: waterHeaters,
        author: "John Doe",
        date: "September 20, 2025",
        views: 500,
        link: "/blog/emergency-water-heater",
        description: "24/7 emergency water heater repair services for when you need hot water restored quickly and efficiently.",
        keywords: ["Water Heater", "Emergency Plumbing"],
    },
    {
        id: 5,
        title: "Modern Bathroom Faucet Trends",
        image: faucets,
        author: "Jane Smith",
        date: "September 15, 2025",
        views: 500,
        link: "/blog/bathroom-faucets",
        description: "Discover the latest trends in bathroom faucet design and how to choose the perfect fixtures for your space.",
        keywords: ["Bathroom Plumbing"],
    },
    {
        id: 6,
        title: "Common Toilet Problems and Solutions",
        image: toiletRepair,
        author: "Jim Bob",
        date: "September 8, 2025",
        views: 500,
        link: "/blog/toilet-problems",
        description: "Learn about the most common toilet issues homeowners face and how professional plumbers can solve them effectively.",
        keywords: ["Toilet", "Plumbing Basics"],
    },
    {
        id: 7,
        title: "Tankless Water Heater Benefits",
        image: waterHeaters,
        author: "John Doe",
        date: "August 30, 2025",
        views: 500,
        link: "/blog/tankless-water-heater",
        description: "Explore the energy-saving benefits of tankless water heaters and why they're becoming the preferred choice for homeowners.",
        keywords: ["Water Heater", "Save Money"],
    },
    {
        id: 8,
        title: "How to Fix a Leaky Faucet",
        image: faucets,
        author: "Jane Smith",
        date: "August 22, 2025",
        views: 500,
        link: "/blog/leaky-faucet",
        description: "Step-by-step guide to identifying and fixing common faucet leaks before they become expensive water waste problems.",
        keywords: ["Kitchen Plumbing", "Leak Detection"],
    },
    {
        id: 9,
        title: "Toilet Running Constantly? Here's Why",
        image: toiletRepair,
        author: "Jim Bob",
        date: "August 15, 2025",
        views: 500,
        link: "/blog/running-toilet",
        description: "Understanding why your toilet runs constantly and the simple repairs that can save you money on your water bill.",
        keywords: ["Toilet", "Save Money"],
    },
    {
        id: 10,
        title: "Water Heater Maintenance Checklist",
        image: waterHeaters,
        author: "John Doe",
        date: "August 5, 2025",
        views: 500,
        link: "/blog/water-heater-maintenance",
        description: "Essential maintenance tasks to extend your water heater's lifespan and maintain optimal performance throughout the year.",
        keywords: ["Water Heater", "Seasonal Plumbing"],
    },
    {
        id: 11,
        title: "Upgrading Your Kitchen Faucet",
        image: faucets,
        author: "Jane Smith",
        date: "July 28, 2025",
        views: 500,
        link: "/blog/kitchen-upgrade",
        description: "Transform your kitchen with a new faucet installation that combines style, functionality, and water efficiency.",
        keywords: ["Kitchen Plumbing"],
    },
    {
        id: 12,
        title: "Toilet Installation Best Practices",
        image: toiletRepair,
        author: "Jim Bob",
        date: "July 20, 2025",
        views: 500,
        link: "/blog/toilet-installation",
        description: "Professional toilet installation techniques that ensure proper sealing, stability, and long-term reliability.",
        keywords: ["Toilet", "Bathroom Plumbing"],
    },
    {
        id: 13,
        title: "Signs Your Water Heater Needs Replacement",
        image: waterHeaters,
        author: "John Doe",
        date: "July 12, 2025",
        views: 500,
        link: "/blog/water-heater-replacement",
        description: "Key warning signs that indicate it's time to replace your aging water heater before it fails completely.",
        keywords: ["Water Heater", "Heating Service"],
    },
    {
        id: 14,
        title: "Choosing the Right Bathroom Faucet",
        image: faucets,
        author: "Jane Smith",
        date: "July 5, 2025",
        views: 500,
        link: "/blog/choosing-faucet",
        description: "Expert advice on selecting bathroom faucets that match your style preferences while meeting practical needs.",
        keywords: ["Bathroom Plumbing"],
    },
    {
        id: 15,
        title: "Toilet Clog Prevention Tips",
        image: toiletRepair,
        author: "Jim Bob",
        date: "June 28, 2025",
        views: 500,
        link: "/blog/clog-prevention",
        description: "Simple habits and maintenance practices to prevent toilet clogs and avoid costly emergency plumbing calls.",
        keywords: ["Toilet", "Drain Service"],
    },
    {
        id: 16,
        title: "Water Heater Energy Efficiency Guide",
        image: waterHeaters,
        author: "John Doe",
        date: "June 20, 2025",
        views: 5020,
        link: "/blog/energy-efficiency",
        description: "Practical tips to improve your water heater's energy efficiency and reduce your monthly utility bills significantly.",
        keywords: ["Water Heater", "Save Money"],
    },
    {
        id: 17,
        title: "Faucet Water Pressure Problems",
        image: faucets,
        author: "Jane Smith",
        date: "June 12, 2025",
        views: 5000,
        link: "/blog/water-pressure",
        description: "Diagnosing and fixing low water pressure issues in your faucets to restore optimal flow throughout your home.",
        keywords: ["Kitchen Plumbing", "Plumbing System"],
    },
    {
        id: 18,
        title: "Eco-Friendly Toilet Options",
        image: toiletRepair,
        author: "Jim Bob",
        date: "June 5, 2025",
        views: 5100,
        link: "/blog/eco-toilets",
        description: "Discover water-saving toilet technologies that help conserve resources while maintaining excellent performance.",
        keywords: ["Toilet", "Water Quality", "Save Money"],
    },
];

export const openings = [
	{
		name: "Licensed Residential Plumber", 
		location: "Seattle, WA",
        type: "Full Time",
        description: "Puget Sound Plumbing and Heating is looking to hire a Licensed Plumber. Heating/AC experience will help as well. The plumbers that work for our company are among the most skilled in Washington State. We are looking for someone who has a can do attitude and has high ambitions. At our company, we hold a high sense of family and team work among the employees. If you are looking to work at a place where you are treated fair, then this is the place for you.",
        qualifications: [
            "Licensed Plumber and/or 2nd or 3rd year plumber apprentice",
            "Valid Washington State driver's license with clean driving record",
            "Able to perform the physical duties of a Plumber",
            "Willingness to work nights and weekends as needed"
        ],
        responsibilities: [
            "Build great relationships with customers and team members",
            "Demonstrate exceptional technical ability in plumbing work",
            "Communicate effectively and complete paperwork in a timely, neat manner",
            "Focus on mostly residential service and some light commercial work",
            "Maintain a strong work ethic and professional standards",
            "Show passion for your work and commitment to career growth"
        ],
        benefits: [
            "Competitive wages and performance bonuses",
            "Comprehensive health, dental, and vision insurance",
            "401(k) retirement plan with company match",
            "Paid time off and holidays",
            "Ongoing training and professional development opportunities",
            "Company vehicle and equipment provided",
            "Uniform and tool allowance",
            "Family-owned business with supportive team culture"
        ]
	},
]