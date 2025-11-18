import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQs() {
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = [
		{
			question: "Do you really offer 24/7 emergency plumbing service?",
			answer:
				"Yes — our licensed plumbers are available around the clock, including nights, weekends, and holidays. Plumbing issues don’t wait for business hours, and neither do we. Whether it’s a burst pipe, major leak, or failed water heater, you’ll always reach a live person ready to dispatch help right away.",
		},
		{
			question: "Should I be home during my plumbing service?",
			answer:
				"We recommend that a homeowner or tenant is present during the service to provide access and discuss details directly with your plumber. This helps ensure you understand the work being done and allows our team to explain any findings or additional recommendations in real time.",
		},
		{
			question: "Which areas do you serve in the Puget Sound region?",
			answer:
				"Puget Sound Plumbing proudly serves homeowners and businesses across Seattle, Bellevue, Kirkland, Issaquah, Redmond, Renton, and surrounding areas. If you’re not sure whether you’re in our service range, give us a quick call — we often travel beyond these areas for special projects.",
		},
		{
			question: "Do you provide free estimates or upfront pricing?",
			answer:
				"Absolutely. We provide free estimates for most standard residential jobs, and we believe in transparent, upfront pricing — no hidden fees or surprise charges. Larger projects may require an in-home evaluation first, but you’ll always receive a clear estimate before we begin work.",
		},
		{
			question: "What types of plumbing work can I do myself versus hiring a pro?",
			answer:
				"Small projects like replacing a faucet or showerhead can often be handled by a handy homeowner, but anything involving water lines, drains, or gas should be done by a licensed plumber. This ensures compliance with Washington State plumbing code and prevents costly damage or safety issues.",
		},
	];

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 mx-auto z-10">
			<h4 className="inline-block relative pb-2 mb-6 w-fit text-[#0C2D70]">
				Frequently Asked Questions
				<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
			</h4>

			<div className="flex flex-col gap-4 w-full">
				{faqs.map((faq, index) => {
					const isOpen = openIndex === index;
					return (
						<div key={index} className="bg-white border border-gray-200 overflow-hidden">
							<button
								onClick={() => toggleFAQ(index)}
								className="w-full flex justify-between items-center p-4 border-b-4 border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020] transition-colors text-left cursor-pointer"
							>
								<h6>
									{faq.question}
								</h6>
								{isOpen ? <ChevronUp /> : <ChevronDown />}
							</button>

							<div
								className={`px-6 transition-all duration-300 overflow-hidden ${
									isOpen ? "max-h-48 py-8" : "max-h-0"
								}`}
							>
								<p>{faq.answer}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
