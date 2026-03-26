import { useState, useEffect } from "react";
import Warranty from "../components/Warranty";
import { getCloudFrontUrl } from "../api/imageService";

export default function WarrantyPage() {
    const [skylineUrl, setSkylineUrl] = useState(null);

    useEffect(() => {
        setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
    }, []);

    return (
        <section 
            className="flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px] bg-cover bg-bottom" 
            style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
        >
            <Warranty />
        </section>
    );
}