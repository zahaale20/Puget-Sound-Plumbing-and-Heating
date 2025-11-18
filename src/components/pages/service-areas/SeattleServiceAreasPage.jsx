import seattle from "../../../assets/seattle-service-area.jpg";

export default function SeattleServiceArea() {
    return (
        <div className="flex flex-col max-w-7xl mx-auto px-6 pb-12 gap-16 mt-[101px] md:mt-[106px] lg:mt-[167px]">

            {/* Seattle Image at natural size with centered text */}
            <div className="relative w-full inline-block">
                <img
                    src={seattle}
                    alt="Seattle Service Area"
                    className="w-auto h-auto max-w-full"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <h1 className="text-white text-center">
                        Professional Plumbing<br />in Seattle, WA
                    </h1>
                </div>
            </div>

        </div>
    );
}
