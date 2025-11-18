import mascot from "../../../../assets/mascot.png";

export default function CoreValues() {
	return (
		<div className="flex flex-row max-w-7xl mx-auto px-6 gap-24">
			<div className="hidden lg:flex self-stretch items-start justify-center w-[350px]">
				<img
					src={mascot}
					alt="Our Mascot"
					className="max-h-full w-auto object-contain"
				/>
			</div>

			<div className="flex-1">
				<h4 className="text-[#0C2D70] relative inline-block pb-2 mb-6">
					Core Values
					<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
				</h4>

				<p className="text-[#2B2B2B] mb-6">
					Our core values, defined by the P.L.U.M.B. acronym, represent our commitment to a
					higher standard of service. We operate with professionalism, expertise, and care to
					ensure a "sound solution" for every customer.
				</p>

				<ul className="text-[#2B2B2B] list-disc pl-6 space-y-2">
					<li><p><strong>Professional:</strong> We treat every customer and job with the highest level of expertise.</p></li>
					<li><p><strong>Local:</strong> A proud Puget Sound business—not a large, impersonal corporation.</p></li>
					<li><p><strong>Understanding:</strong> We listen and provide solutions that truly fit your home.</p></li>
					<li><p><strong>Mastery:</strong> Our skilled team ensures the job is done right the first time.</p></li>
					<li><p><strong>Backbone:</strong> We are the strong, reliable foundation of your home's plumbing system.</p></li>
				</ul>
			</div>

		</div>
	);
}
