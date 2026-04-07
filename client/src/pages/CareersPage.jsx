import { useState } from "react";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import { FaChevronDown } from "react-icons/fa";
import { openings } from "../data/data";
import { getImageUrl } from "../services/imageService";
import JobApplicationForm from "../components/forms/JobApplicationForm";
import { PageTitle, SectionTitle } from "../components/ui/UnderlinedHeading";

export default function CareersPage() {
	const [expandedJob, setExpandedJob] = useState(null);

	const toggleJob = (index) => {
		setExpandedJob(expandedJob === index ? null : index);
	};

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<ImageWithLoader
					src={getImageUrl("site/pattern1.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<PageTitle>Careers</PageTitle>
					<p className="relative inline-block">
						Ready for your next step? We're hiring experienced plumbers to join our high-performing
						residential team.
					</p>
				</div>
			</section>

			{/* Current Openings Section */}
			<section className="flex justify-center w-full pt-16 bg-white">
				<div className="flex flex-col w-full max-w-7xl mx-auto px-6 gap-12 text-[#2B2B2B]">
					<div className="flex flex-col items-center w-full">
						<div className="w-full mb-6 text-left">
							<SectionTitle as="h4">Current Openings</SectionTitle>
						</div>

						<div className="flex flex-col gap-4 w-full">
							{openings.map((job, index) => (
								<div key={index} className="bg-white border border-gray-200 overflow-hidden">
									<button
										onClick={() => toggleJob(index)}
										className="w-full flex justify-between items-center p-4 border-b-4 border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020] transition-colors text-left cursor-pointer"
									>
										<div className="flex-1">
											<h5 className="text-[#0C2D70] mb-1">{job.name}</h5>
											<div className="flex flex-wrap gap-1 text-sm">
												<span>{job.type}</span>
												<span>•</span>
												<span>{job.location}</span>
											</div>
										</div>
										<FaChevronDown
											className={`text-[#0C2D70] text-xl transition-transform duration-300 flex-shrink-0 ml-4 ${
												expandedJob === index ? "rotate-180" : ""
											}`}
										/>
									</button>

									{expandedJob === index && (
										<div className="px-4 pb-4 border-t border-gray-200">
											<div className="mt-4">
												<h6 className="block mb-2">About This Position</h6>
												<span className="block leading-relaxed">{job.description}</span>
											</div>
											<div className="mt-4">
												<h6 className="block mb-2">Qualifications</h6>
												<ul className="space-y-1">
													{job.qualifications.map((q, i) => (
														<li key={i} className="flex items-start gap-2">
															<h6 className="text-[#B32020]">•</h6>
															<span className="leading-relaxed">{q}</span>
														</li>
													))}
												</ul>
											</div>
											<div className="mt-4">
												<h6 className="block mb-2">Responsibilities</h6>
												<ul className="space-y-1">
													{job.responsibilities.map((r, i) => (
														<li key={i} className="flex items-start gap-2">
															<h6 className="text-[#B32020]">•</h6>
															<span className="leading-relaxed">{r}</span>
														</li>
													))}
												</ul>
											</div>
											<div className="mt-4">
												<h6 className="mb-2">Benefits</h6>
												<ul className="space-y-1">
													{job.benefits.map((b, i) => (
														<li key={i} className="flex items-start gap-2">
															<h6 className="text-[#B32020]">•</h6>
															<span className="leading-relaxed">{b}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Application Form Section */}
			<section className="relative overflow-hidden flex justify-center w-full py-16 text-[#2B2B2B]">
				<ImageWithLoader
					src={getImageUrl("site/seattle-skyline.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="flex flex-col w-full max-w-7xl mx-auto px-6">
					<div className="w-full mb-6 text-left">
						<SectionTitle as="h4">Apply Now</SectionTitle>
					</div>

					<JobApplicationForm />
				</div>
			</section>
		</div>
	);
}
