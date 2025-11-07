import { FaPhone } from "react-icons/fa";
import womanCalling from "../../../../assets/woman-calling.png";

export default function CallNow() {
    return (
		<section className="flex flex-col w-full bg-[#F5F5F5] overflow-hidden">
			<div className="flex flex-row w-full max-w-7xl px-6 mx-auto gap-16 items-start">
                {/* Image */}
                <div className="hidden lg:block">
                    <img
                        src={womanCalling}
                        alt="Woman Calling Plumbers"
                        className="mt-4 w-80 h-87 xl:h-81 object-cover"
                    />
                </div>

                {/* Header + Text */}
                <div className="flex-1 py-16">
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
                        Call Now
                        <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
                    </h4>

                    <p className="text-[#2B2B2B] mb-6">
                        Whether it’s a burst pipe, a cold shower, or a strange noise from your furnace, help is just a call away. Our certified plumbers and heating specialists are available 24/7 to keep your home safe, comfortable, and running smoothly. Don’t wait — talk to a real expert today and get the reliable service you deserve.
                    </p>

					<a
						href="tel:206-938-3219"
						className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]"
					>
						<FaPhone />
						(206) 938-3219
					</a>
                </div>
            </div>
        </section>
    );
}