import { useState, useEffect } from "react";
import LimitedTimeOffers from "../components/LimitedTimeOffers";
import { getSignedUrl } from "../api/imageService";

export default function LimitedTimeOffersPage() {
    const [patternUrl, setPatternUrl] = useState(null);
    const [skylineUrl, setSkylineUrl] = useState(null);

    useEffect(() => {
        getSignedUrl("private/pattern1.png").then(setPatternUrl);
        getSignedUrl("private/seattle-skyline.png").then(setSkylineUrl);
    }, []);

    return (
        <div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
            <section
                className="relative flex w-full py-16 bg-cover bg-bottom"
                style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none" }}
            >
                <div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
                    <h3 className="relative inline-block pb-2 w-fit">
                        Coupons
                        <span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
                    </h3>
                    <p className="relative inline-block">
                        Save on your next service with our limited time offers!
                    </p>
                </div>
            </section>

            <section
                className="flex justify-center w-full py-16 bg-cover bg-bottom"
                style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
            >
                <LimitedTimeOffers textColor="text-[#0C2D70]" />
            </section>
        </div>
    );
}