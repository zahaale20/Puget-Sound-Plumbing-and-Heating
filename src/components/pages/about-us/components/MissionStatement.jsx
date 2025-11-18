export default function OurMission() {
    return (
        <div className="flex flex-col max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="w-full">
                <h4 className="text-[#0C2D70] text-left relative inline-block pb-2 mb-6">
                    Mission Statement
                    <span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
                </h4>
            </div>

            {/* Mission statement */}
            <div className="flex justify-center w-full">
                <h4 className="text-[#2B2B2B] text-center">
                    "Our mission is to deliver trusted plumbing solutions to homeowners and businesses
                    across the Puget Sound, big enough to serve every need yet small enough to care
                    for each customer."
                </h4>
            </div>
        </div>
    );
}
