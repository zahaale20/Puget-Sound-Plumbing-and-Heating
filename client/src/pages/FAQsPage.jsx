import { useState } from "react";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getCloudFrontUrl } from "../services/imageService";
import { FAQsData } from "../data/data";
import Seo from "../components/seo/Seo";

export default function FAQs() {
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = FAQsData;
	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	const firstSection = faqs.slice(0, faqs.length - 5);
	const secondSection = faqs.slice(faqs.length - 5);

	const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

	const FAQItem = ({ faq, globalIndex }) => {
		const isOpen = openIndex === globalIndex;
		return (
			<div className="border border-gray-200 overflow-hidden bg-white">
				<button
					onClick={() => toggleFAQ(globalIndex)}
					className={`w-full flex justify-between items-center p-4 border-b-4 text-left transition-colors cursor-pointer ${isOpen ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020]"}`}
				>
					<h6>{faq.question}</h6>
					{isOpen ? <ChevronUp /> : <ChevronDown />}
				</button>
				<div
					className={`px-6 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 py-8" : "max-h-0"}`}
				>
					<p>{faq.answer}</p>
				</div>
			</div>
		);
	};

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<Seo
				title="Plumbing FAQs"
				description="Answers to common questions about plumbing, drains, sewer, water heaters, and service coverage from Puget Sound Plumbing and Heating."
				path="/faqs"
				jsonLd={faqJsonLd}
			/>
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h1 className="relative inline-block pb-2 w-fit text-2xl md:text-3xl font-semibold">
						Frequently Asked Questions
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h1>
					<p className="relative inline-block">
						Below are answers to the most common questions about our plumbing and heating services.
					</p>
				</div>
			</section>

			<section className="flex justify-center w-full pt-16 bg-white text-[#2B2B2B] mb-6">
				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full">
					{firstSection.map((faq, index) => (
						<FAQItem key={index} faq={faq} globalIndex={index} />
					))}
				</div>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full pb-16 text-[#2B2B2B]">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full">
					{secondSection.map((faq, index) => (
						<FAQItem key={index} faq={faq} globalIndex={firstSection.length + index} />
					))}
				</div>
			</section>
		</div>
	);
}
