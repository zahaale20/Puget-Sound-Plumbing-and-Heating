import { useState } from "react";
import { FaTag, FaCut } from "react-icons/fa";

export default function LimitedTimeOffers() {
	const coupons = [
		{ discount: "$19.50 OFF", condition: "ANY SERVICE UP TO $150" },
		{ discount: "$59.50 OFF", condition: "ANY SERVICE OVER $250" },
		{ discount: "$69.50 OFF", condition: "ANY SERVICE OVER $800" },
		{ discount: "$79.75 OFF", condition: "ANY SERVICE OVER $1,500" },
	];

	const [isPopUpOpen, setIsPopUpOpen] = useState(false);
	const [selectedCoupon, setSelectedCoupon] = useState(null);

	let scrollY = 0;

	const openModal = (coupon) => {
		setSelectedCoupon(coupon);
		scrollY = window.scrollY || window.pageYOffset;
		document.documentElement.style.scrollBehavior = "auto";
		document.body.style.position = "fixed";
		document.body.style.top = `-${scrollY}px`;
		document.body.style.left = "0";
		document.body.style.right = "0";
		document.body.style.overflow = "hidden";
		setIsPopUpOpen(true);
	};

	const closeModal = () => {
		document.body.style.position = "";
		document.body.style.top = "";
		document.body.style.left = "";
		document.body.style.right = "";
		document.body.style.overflow = "";
		window.scrollTo(0, scrollY || 0);

		setIsPopUpOpen(false);
		setSelectedCoupon(null);
	};

	return (
		<>
			<div className="flex flex-col w-full max-w-7xl px-6 space-y-6">
				{/* Header */}
				<div className="space-y-6 text-center text-white">
					{/* Title */}
					<h4 className="inline-block relative pb-2">
						Limited Time Offers
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>

					{/* Description */}
					<p>
						Must be mentioned when scheduling your appointment. 1 coupon per customer.
					</p>
				</div>

				{/* Coupon Cards */}
				<div className="flex flex-wrap justify-center gap-6">
					{coupons.map((coupon, idx) => (
						// Coupon Card
						<div
							key={idx}
							className="flex-1 min-w-[250px] bg-white p-6 text-center flex flex-col items-center gap-4 relative border-4 border-dashed border-[#B32020] box-border"
						>
							{/* Tag Icon */}
							<div className="text-[#B32020] text-5xl">
								<FaTag />
							</div>

							{/* Coupon Discount */}
							<h4 className="text-[#0C2D70] uppercase border-b-4 border-[#B32020] pb-1">
								{coupon.discount}
							</h4>

							{/* Coupon Conditions */}
							<p className="text-[#2B2B2B] uppercase">{coupon.condition}</p>
							<p className="text-[#2B2B2B] mt-2">Cannot be combined with other offers.</p>

							{/* Scissors Icon */}
							<div className="absolute -right-[16px] bottom-1/4 text-[#B32020] text-3xl rotate-270">
								<FaCut />
							</div>

							{/* Redeem Offer Button */}
							<button
								onClick={() => openModal(coupon)}
								className="flex items-center justify-center gap-2 px-4 py-3 text-white text-sm font-semibold uppercase cursor-pointer transition-all duration-300 bg-[#B32020] hover:bg-[#7a1515]"
							>
								Redeem Offer
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Redeem Offer Pop Up */}
			{isPopUpOpen && (
				<div className="fixed inset-0 bg-[#2b2b2b]/50 flex justify-center items-center z-50">
					<div className="bg-white p-8 sm:p-12 md:p-16 md:max-w-2xl w-full h-full md:h-auto relative box-border max-h-[100vh] overflow-auto">
						{/* Close Pop Up Button */}
						<button
							onClick={closeModal}
							className="absolute top-6 right-6 text-4xl cursor-pointer"
							aria-label="Close modal"
						>
							×
						</button>

						{/* Title */}
						<h3 className="text-[#0C2D70] inline-block relative mb-6">
							Redeem Offer:
						</h3>

						{/* Coupon Card */}
						<div className="flex-1 bg-white p-6 pr-8 text-center flex flex-col items-center gap-4 relative border-4 border-dashed border-[#B32020] mb-8 box-border">
							{/* Tag Icon */}
							<div className="text-[#B32020] text-5xl">
								<FaTag />
							</div>

							{/* Coupon Discount */}
							<h4 className="text-[#0C2D70] uppercase border-b-4 border-[#B32020] pb-1 text-3xl">
								{selectedCoupon?.discount}
							</h4>

							{/* Coupon Conditions */}
							<p className="text-[#2B2B2B] uppercase text-lg">{selectedCoupon?.condition}</p>
							<p className="text-[#2B2B2B] mt-2">Cannot be combined with other offers.</p>

							{/* Scissors Icon */}
							<div className="absolute -right-[16px] bottom-1/4 text-[#B32020] text-3xl rotate-270">
								<FaCut />
							</div>
						</div>

						{/* Form */}
						<form
							onSubmit={(e) => {
								e.preventDefault();
								alert("Offer sent to your email!");
								closeModal();
							}}
							className="flex flex-col gap-4 text-left"
						>
							{/* First + Last Name */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="text-[#2B2B2B]">
										First Name <span className="text-[#B32020] italic">*</span>
									</label>
									<input
										required
										type="text"
										name="firstName"
										className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
									/>
								</div>

								<div>
									<label className="text-[#2B2B2B]">
										Last Name <span className="text-[#B32020] italic">*</span>
									</label>
									<input
										required
										type="text"
										name="lastName"
										className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
									/>
								</div>
							</div>

							{/* Email + Phone */}
							<div>
								<label className="text-[#2B2B2B]">
									Email <span className="text-[#B32020] italic">*</span>
								</label>
								<input
									required
									type="email"
									name="email"
									className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
								/>
							</div>

							<div>
								<label className="text-[#2B2B2B]">
									Phone <span className="text-[#B32020] italic">*</span>
								</label>
								<input
									required
									type="tel"
									name="phone"
									className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
								/>
							</div>

							{/* Submit */}
							<button
								type="submit"
								className="bg-[#B32020] text-white w-full py-3 font-semibold hover:bg-[#7a1515] transition"
							>
								Email Offer
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
