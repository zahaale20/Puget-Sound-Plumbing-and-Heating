import { FaArrowRight } from "react-icons/fa";
import plumbingTruck from "../../../../assets/plumbing-truck.png";

export default function FAQS() {
    return (
        <section className="flex flex-col w-full bg-[#F5F5F5] overflow-hidden">
            <div className="flex flex-row w-full max-w-7xl px-6 mx-auto gap-12 items-start">
                {/* Header + Text */}
                <div className="flex-1 py-16">
                    <h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
                        Frequently Asked Questions
                        <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
                    </h4>

                    <p className="text-[#2B2B2B] mb-6">
                        Got questions about your plumbing or heating system? We’ve heard them all — and we’ve got the answers. From what to do during an emergency leak to how often you should service your water heater, our FAQ section covers the topics our customers ask us most. Save time, get peace of mind, and learn how to keep your home’s systems running smoothly.
                    </p>

                    {/* Right-aligned button */}
                    <div className="flex justify-end">
                        <a href="#" className="text-[#0C2D70] font-semibold flex items-center gap-1 hover:underline transition-colors whitespace-nowrap">
                            Read Our FAQs <FaArrowRight />
                        </a>
                    </div>
                </div>
                
                {/* Image */}
                <div className="hidden xl:block">
                    <img
                        src={plumbingTruck}
                        alt="Plumbing Truck"
                        className="mt-4 w-152 h-78 object-cover mt-10"
                    />
                </div>
            </div>
        </section>
    );
}