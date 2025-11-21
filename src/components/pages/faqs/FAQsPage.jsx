import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQs() {
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = [
		{
			question: "Where are you located?",
			answer:
				"Our home office has been in Burien, WA, for the past 20 years. We dispatch highly qualified, certified technicians to serve the entire greater Puget Sound area.",
		},
		{
			question: "Is your work guaranteed?",
			answer:
				"Yes, it is. We are confident in our team and stand by our work. We provide a satisfaction guarantee and warranty that our service and work will be completed properly, in a fast, friendly, and professional manner. For all specific warranty questions regarding parts and labor, please speak with your technician.",
		},
		{
			question: "Do you work weekends? Is there an extra charge? What about holidays?",
			answer:
				"We are open 24 hours a day, 7 days a week, 365 days a year. We do not charge extra for holidays or weekends. We are here to help whenever you need us.",
		},
		{
			question: "Why can’t I get a quote over the phone?",
			answer:
				"We understand you want an accurate price. Because every situation is unique, it’s impossible for us to give an exact price without seeing the problem in person. What appears to be a simple issue often has underlying complications that only a professional technician can identify. Our technician will assess the situation and provide a written, upfront price before any work begins.",
		},
		{
			question: "What if the quote is more than I can afford?",
			answer:
				"We believe in transparency. You will receive a written, upfront price before any work begins, and we will never start a job without your approval. If the quote is over your budget, you have the option to send our technician back at no extra cost. We also have flexible financing options available to help you move forward with the necessary repairs.",
		},
		{
			question: "What is a dispatch fee?",
			answer:
				"A dispatch fee is a minimum charge for sending a certified technician to your home. This fee covers the technician’s time and expertise to diagnose the problem and provide you with a written, upfront quote for the solution. This is not a hidden cost; it is part of our transparent pricing model.",
		},
		{
			question: "Can I speak to a technician about my problem over the phone?",
			answer:
				"Our service technicians are dispatched remotely to provide faster service and are rarely in our office. Because every situation is different, we send a technician to your home to properly investigate the issue. This ensures you get an accurate diagnosis and a written quote.",
		},
		{
			question: "Are you licensed and insured?",
			answer:
				"Yes, we are a fully licensed and insured plumbing and heating company (License #PUGETSP929CF). Our plumbers are highly trained, certified professionals who stay up-to-date on all local codes and regulations. We carry full liability insurance for your peace of mind.",
		},
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
		<div className="flex flex-col w-full max-w-7xl px-6 py-16 space-y-6 mx-auto mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<h4 className="inline-block relative pb-2 w-fit text-[#0C2D70]">
				Frequently Asked Questions
				<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
			</h4>

			<p className="text-[#2B2B2B]">
				Have questions about plumbing and heating services from Puget Sound Plumbing and Heating? Below are answers to the most common questions we receive.
			</p>

			<div className="flex flex-col gap-4 w-full">
				{faqs.map((faq, index) => {
					const isOpen = openIndex === index;
					return (
						<div key={index} className="bg-white border border-gray-200 overflow-hidden">
							<button
								onClick={() => toggleFAQ(index)}
								className="w-full flex justify-between items-center p-4 border-b-4 border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020] transition-colors text-left cursor-pointer"
							>
								<h6>{faq.question}</h6>
								{isOpen ? <ChevronUp /> : <ChevronDown />}
							</button>

							<div
								className={`px-6 transition-all duration-300 overflow-hidden ${
									isOpen ? "max-h-96 py-8" : "max-h-0"
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
