import { useState } from "react";
import { FaTag, FaCut } from "react-icons/fa";

import pattern from "../../../../assets/pattern1.png";

export default function CurrentCoupons() {
	const coupons = [
		{ discount: "$19.50 OFF", condition: "ANY SERVICE UP TO $150" },
		{ discount: "$59.50 OFF", condition: "ANY SERVICE OVER $250" },
		{ discount: "$69.50 OFF", condition: "ANY SERVICE OVER $800" },
		{ discount: "$79.75 OFF", condition: "ANY SERVICE OVER $1,500" },
	];

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCoupon, setSelectedCoupon] = useState(null);

	const openModal = (coupon) => {
		setSelectedCoupon(coupon);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedCoupon(null);
	};

	return (
		<>
			<section
				className="relative w-full bg-[#0C2D70] py-16 flex justify-center overflow-hidden"
				style={{
					backgroundImage: `url(${pattern})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			>
				<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>

				<div className="relative flex flex-col w-full max-w-7xl px-6 z-10">
					{/* Header */}
					<div className="mb-6 text-center">
						<h4 className="text-white relative inline-block pb-2 mb-6">
							Limited Time Offers
							<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
						</h4>
						<p className="text-white mx-auto">
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
			</section>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
					<div className="bg-white p-16 max-w-2xl w-full relative shadow-lg">

						{/* Close Button */}
						<button
							onClick={closeModal}
							className="absolute top-6 right-6 text-2xl cursor-pointer"
						>
							×
						</button>

						<h3 className="text-[#0C2D70] mb-2 text-xl font-semibold">
							Redeem: {selectedCoupon?.discount}
						</h3>
						<p className="mb-4 text-gray-700">
							Fill out the form below and we’ll email this offer to you.
						</p>

						{/* Form */}
						<form
							onSubmit={(e) => {
								e.preventDefault();
								alert("Offer sent to your email!");
								closeModal();
							}}
							className="flex flex-col gap-4"
						>
							<div className="flex gap-4 w-full">
								<input
									required
									type="text"
									placeholder="First Name"
									className="border p-3 w-1/2"
								/>
								<input
									required
									type="text"
									placeholder="Last Name"
									className="border p-3 w-1/2"
								/>
							</div>

							<input
								required
								type="email"
								placeholder="Email Address"
								className="border p-3"
							/>

							<input
								required
								type="tel"
								placeholder="Phone Number"
								className="border p-3"
							/>

							<button
								type="submit"
								className="bg-[#B32020] text-white w-full py-3 font-semibold hover:bg-[#7a1515] transition"
							>
								Email My Offer
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
