import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import pattern from "../../../../../assets/pattern1.png";

import waterHeaters from "../../../../../assets/water-heaters.png";
import faucets from "../../../../../assets/faucets.png";
import toiletRepair from "../../../../../assets/toilet-repair.png";
import garbageDisposal from "../../../../../assets/garbage-disposal.png";
import waterFiltration from "../../../../../assets/water-filtration.png";
import plumbingFixtures from "../../../../../assets/plumbing-fixtures.png";

export default function Services() {
	const services = [
		{ image: waterHeaters, title: "Water Heaters", description: "Reliable installation and repair for tank and tankless heaters." },
		{ image: faucets, title: "Faucet Repair", description: "Fix leaky or outdated faucets with fast, precise repair or full replacement service." },
		{ image: toiletRepair, title: "Toilet Repair", description: "Quick and dependable toilet service to ensure smooth operation every day." },
		{ image: garbageDisposal, title: "Garbage Disposal", description: "Efficient repair or replacement for kitchen disposals, keeping cleanup hassle-free." },
		{ image: waterFiltration, title: "Water Filtration", description: "Enhance water quality with professional filtration system setup and maintenance." },
		{ image: plumbingFixtures, title: "Plumbing Fixtures", description: "Upgrade or repair sinks, showers, and fixtures with expert craftsmanship." },
	];

	const [visibleCount, setVisibleCount] = useState(4);
	const [offset, setOffset] = useState(0);
	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(0);
	const cardGap = 16;

	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				const computedStyle = window.getComputedStyle(containerRef.current);
				const paddingLeft = parseFloat(computedStyle.paddingLeft);
				const paddingRight = parseFloat(computedStyle.paddingRight);
				const totalWidth = containerRef.current.clientWidth;
				setContainerWidth(totalWidth - paddingLeft - paddingRight);
			}
		};

		const updateVisibleCount = () => {
			const width = window.innerWidth;
			if (width >= 1280) setVisibleCount(4);
			else if (width >= 1024) setVisibleCount(3);
			else if (width >= 768) setVisibleCount(2);
			else setVisibleCount(1);
		};

		updateWidth();
		updateVisibleCount();

		window.addEventListener("resize", updateWidth);
		window.addEventListener("resize", updateVisibleCount);

		return () => {
			window.removeEventListener("resize", updateWidth);
			window.removeEventListener("resize", updateVisibleCount);
		};
	}, []);

	useEffect(() => setOffset(0), [visibleCount]);

	const cardWidth = containerWidth
		? Math.floor((containerWidth - cardGap * (visibleCount - 1)) / visibleCount)
		: 0;

	const maxOffset = services.length - visibleCount;

	const handleScroll = (dir) => {
		setOffset((prev) => {
			if (dir === "next") return Math.min(prev + 1, maxOffset);
			else return Math.max(prev - 1, 0);
		});
	};

	return (
		<section
			className="relative flex flex-col items-center w-full py-16 overflow-hidden"
			style={{
				backgroundImage: `url(${pattern})`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "cover",
			}}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>

			{/* Foreground content */}
			<div className="relative z-10 w-full max-w-7xl px-6 mx-auto text-center text-white">
				<h3 className="inline-block relative pb-2 mb-6">
					Our Services
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h3>
			</div>

			<div className="relative flex w-full justify-center z-10">
				<div ref={containerRef} className="relative w-full max-w-7xl px-22">
					<div className="overflow-hidden">
						<motion.div
							animate={{ x: Math.round(-offset * (cardWidth + cardGap)) }}
							transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
							className="flex items-stretch gap-4 overflow-visible"
							style={{ willChange: "transform" }}
						>
							{services.map((service, idx) => (
								<div
									key={idx}
									className="group relative rounded-2xl shadow-lg cursor-pointer overflow-hidden"
									style={{
										flex: `0 0 ${cardWidth}px`,
										width: `${cardWidth}px`,
										minHeight: "400px",
										backgroundImage: `url(${service.image})`,
										backgroundSize: "cover",
										backgroundPosition: "center",
									}}
								>
									{/* Gradient overlay */}
									<div className="absolute inset-0 bg-[linear-gradient(0deg,_#00000088_15%,_#ffffff44_100%)] z-10 pointer-events-none"></div>

									{/* Title */}
									<h3 className="absolute bottom-4 left-4 text-white text-lg font-semibold z-20 pointer-events-none">
										{service.title}
									</h3>
								</div>
							))}
						</motion.div>
					</div>

					<button
						onClick={() => handleScroll("prev")}
						disabled={offset === 0}
						className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-3xl p-2 z-10 cursor-pointer disabled:opacity-0 transition-all ml-6"
					>
						<FaArrowLeft />
					</button>

					<button
						onClick={() => handleScroll("next")}
						disabled={offset === maxOffset}
						className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-3xl p-2 z-10 cursor-pointer disabled:opacity-0 transition-all mr-6"
					>
						<FaArrowRight />
					</button>
				</div>
			</div>
		</section>
	);
}
