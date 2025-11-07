import skyline from "../../../assets/seattle-skyline.png";

export default function ResourcesPage() {

	return (
		<>
			<section className="flex justify-center w-full bg-white mt-[101px] md:mt-[106px] lg:mt-[167px]">
				<div className="flex flex-col w-full max-w-7xl px-6 py-16 mx-auto items-start">
					{/* Header + Text */}
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
						Resources
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>

					<p className="text-[#2B2B2B] mb-6">
						For over 20 years, Puget Sound Plumbing and Heating has been Seattle’s trusted, family-run choice for reliable home comfort solutions. Our licensed professionals deliver expert workmanship, honest pricing, and outstanding customer care on every job. Whether it’s a minor repair or an urgent emergency, we’re available 24/7 to keep your home safe, comfortable, and running smoothly.
					</p>
				</div>
			</section>

			<section className="flex justify-center w-full bg-cover bg-bottom" style={{ backgroundImage: `url(${skyline})` }}>
				<div className="flex flex-col w-full max-w-7xl px-6 py-16 mx-auto items-start">
					{/* Header + Text */}
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
						Resources
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>

					<p className="text-[#2B2B2B] mb-6">
						For over 20 years, Puget Sound Plumbing and Heating has been Seattle’s trusted, family-run choice for reliable home comfort solutions. Our licensed professionals deliver expert workmanship, honest pricing, and outstanding customer care on every job. Whether it’s a minor repair or an urgent emergency, we’re available 24/7 to keep your home safe, comfortable, and running smoothly.
					</p>
				</div>
			</section>
		</>
	);
}