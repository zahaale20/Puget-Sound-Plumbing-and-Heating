import { FaTag, FaCut } from "react-icons/fa";

import pattern from "../../../../../assets/pattern1.png";

export default function Discounts() {
	const coupons = [
		{ discount: "$19.50 OFF", condition: "ANY SERVICE UP TO $150" },
		{ discount: "$59.50 OFF", condition: "ANY SERVICE OVER $250" },
		{ discount: "$69.50 OFF", condition: "ANY SERVICE OVER $800" },
		{ discount: "$79.75 OFF", condition: "ANY SERVICE OVER $1,500" },
	];

	return (
		<section
			className="relative w-full bg-[#0C2D70] py-16 flex justify-center overflow-hidden"
			style={{
				backgroundImage: `url(${pattern})`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "cover",
			}}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>

			<div className="relative flex flex-col w-full max-w-7xl px-6 z-10">
				{/* Header */}
				<div className="mb-6 text-center">
					<h3 className="text-white relative inline-block pb-2 mb-6">
						Current Discounts
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h3>
					<p className="text-white mx-auto">
						Must be mentioned when scheduling your appointment. 1 coupon per customer.
					</p>
				</div>

				{/* Coupon Cards Row */}
				<div className="flex flex-wrap justify-center gap-8">
					{coupons.map((coupon, idx) => (
						<div
							key={idx}
							className="flex-1 min-w-[220px] bg-white rounded-2xl p-6 text-center text-[#0C2D70] flex flex-col items-center gap-4 relative border-4 border-dashed border-[#B32020]"
						>
							<div className="text-[#B32020] text-5xl">
								<FaTag />
							</div>
							<h3 className="font-bold uppercase border-b-4 border-[#B32020] pb-1">
								{coupon.discount}
							</h3>
							<p className="uppercase">{coupon.condition}</p>
							<p className="mt-2">Cannot be combined with other offers.</p>
							<div className="absolute -right-[16px] bottom-1/4 text-[#B32020] text-3xl rotate-270">
								<FaCut />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
