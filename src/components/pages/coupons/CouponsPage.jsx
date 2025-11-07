import { FaTag, FaCut } from "react-icons/fa";

import skyline from "../../../assets/seattle-skyline.png";
import { coupons } from "./couponsData";

export default function CouponsPage() {

	return (
		<>
			{/* Limited Time Offers Section */}
			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[172px]"
				style={{ backgroundImage: `url(${skyline})` }}
			>
	
				<div className="relative flex flex-col w-full max-w-7xl px-6 z-10">
					{/* Header */}
					<div className="mb-6">
						<h4 className="text-[#0C2D70] relative inline-block pb-2 mb-6">
							Limited Time Offers
							<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
						</h4>
						<p className="text-[#2B2B2B] mx-auto">
							Must be mentioned when scheduling your appointment. 1 coupon per customer.
						</p>
					</div>
	
					{/* Coupon Cards Row */}
					<div className="flex flex-wrap justify-center gap-8">
						{coupons.map((coupon, idx) => (
							<div
								key={idx}
								className="flex-1 min-w-[220px] bg-white p-6 text-center flex flex-col items-center gap-4 relative border-4 border-dashed border-[#B32020]"
							>
								<div className="text-[#B32020] text-5xl">
									<FaTag />
								</div>
								<h4 className="text-[#0C2D70] uppercase border-b-4 border-[#B32020] pb-1">
									{coupon.discount}
								</h4>
								<p className="text-[#2B2B2B] uppercase">{coupon.condition}</p>
								<p className="text-[#2B2B2B] mt-2">Cannot be combined with other offers.</p>
								<div className="absolute -right-[16px] bottom-1/4 text-[#B32020] text-3xl rotate-270">
									<FaCut />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}