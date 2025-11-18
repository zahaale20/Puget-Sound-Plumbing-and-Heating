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
            <div className="flex justify-center w-full mb-12">
                <h4 className="text-[#2B2B2B] text-center">
                    "Our mission is to deliver trusted plumbing solutions to homeowners and businesses
                    across the Puget Sound, big enough to serve every need yet small enough to care
                    for each customer."
                </h4>
            </div>

            {/* About Video */}
            <div className="flex justify-center w-full">
                <div className="w-full lg:w-2/3 aspect-video">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/oxsX9yhjTGA"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
