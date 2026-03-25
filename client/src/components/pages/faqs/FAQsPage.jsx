import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import skyline from "../../../assets/seattle-skyline.png";
import pattern from "../../../assets/pattern1.png";

export default function FAQs() {
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = [
		{ question: "Where are you located?", answer: "Our home office has been in Burien, WA, for the past 20 years. We dispatch highly qualified, certified technicians to serve the entire greater Puget Sound area." },
		{ question: "Is your work guaranteed?", answer: "Yes, it is. We stand by our work with a satisfaction guarantee and warranty. For detailed warranty questions regarding parts or labor, please speak with your technician." },
		{ question: "Do you work weekends? Is there an extra charge? What about holidays?", answer: "We are open 24 hours a day, 7 days a week, 365 days a year — with *no* extra charge for weekends or holidays." },
		{ question: "Why can’t I get a quote over the phone?", answer: "Every situation is different. A technician must see the problem in person to provide an accurate, written quote." },
		{ question: "What if the quote is more than I can afford?", answer: "You’ll always receive an upfront price before any work begins. If it’s out of budget, we offer flexible financing with no obligation to proceed." },
		{ question: "What is a dispatch fee?", answer: "A dispatch fee covers a technician's time and expertise to diagnose the problem and provide an upfront quote." },
		{ question: "Can I speak to a technician over the phone?", answer: "Our technicians are dispatched remotely. To ensure accuracy, we send a plumber to your home to diagnose the issue." },
		{ question: "Are you licensed and insured?", answer: "Yes — fully licensed and insured (License #PUGETSP929CF), with certified plumbers trained in all local codes." },
		{ question: "Do you really offer 24/7 emergency service?", answer: "Yes — day or night, weekends, holidays, or after-hours. A live person always picks up." },
		{ question: "Should I be home during my plumbing service?", answer: "We recommend having someone present to allow access and discuss findings directly with our technician." },
		{ question: "Which areas do you serve?", answer: "We proudly serve Seattle, Bellevue, Kirkland, Issaquah, Redmond, Renton, and surrounding areas." },
		{ question: "Do you provide free estimates?", answer: "Yes — most residential jobs come with free estimates and completely transparent pricing." },
		{ question: "What work can I do myself?", answer: "Simple tasks like changing a showerhead are fine DIY projects, but anything involving water lines, drains, or gas should be handled by a licensed pro." },
	];

	// Split FAQs into two groups so skyline background appears properly
	const firstSection = faqs.slice(0, faqs.length - 5);
	const secondSection = faqs.slice(faqs.length - 5);

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Frequently Asked Questions
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					<p className="relative inline-block">
						Below are answers to the most common questions about our plumbing and heating services.
					</p>
				</div>
			</section>

			{/* First 9 FAQs (white background) */}
			<section className="flex justify-center w-full pt-16 bg-white text-[#2B2B2B] mb-6">
				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full">
					{firstSection.map((faq, index) => {
						const globalIndex = index;
						const isOpen = openIndex === globalIndex;

						return (
							// Dropdown
							<div key={globalIndex} className="border border-gray-200 overflow-hidden bg-white">
								{/* Question */}
								<button
									onClick={() => toggleFAQ(globalIndex)}
									className={`w-full flex justify-between items-center p-4 border-b-4 text-left transition-colors cursor-pointer
										${
											isOpen
												? "border-[#B32020] bg-[#F5F5F5]"
												: "border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020]"
										}
									`}
								>
									<h6>{faq.question}</h6>
									{isOpen ? <ChevronUp /> : <ChevronDown />}
								</button>

								{/* Answer */}
								<div className={`px-6 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 py-8" : "max-h-0"}`}>
									<p>{faq.answer}</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Second FAQs section with skyline background */}
			<section
				className="flex justify-center w-full pb-16 bg-cover bg-bottom text-[#2B2B2B]"
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full">
					{secondSection.map((faq, index) => {
						const globalIndex = firstSection.length + index;
						const isOpen = openIndex === globalIndex;

						return (
							// Dropdown
							<div key={globalIndex} className="border border-gray-200 overflow-hidden bg-white">
								{/* Question */}
								<button
									onClick={() => toggleFAQ(globalIndex)}
									className={`w-full flex justify-between items-center p-4 border-b-4 text-left transition-colors cursor-pointer
										${
											isOpen
												? "border-[#B32020] bg-[#F5F5F5]"
												: "border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020]"
										}
									`}
								>
									<h6>{faq.question}</h6>
									{isOpen ? <ChevronUp /> : <ChevronDown />}
								</button>

								{/* Answer */}
								<div className={`px-6 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 py-8" : "max-h-0"}`}>
									<p>{faq.answer}</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</div>
	);
}
