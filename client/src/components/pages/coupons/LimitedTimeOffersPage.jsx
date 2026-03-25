import LimitedTimeOffers from "../home/components/LimitedTimeOffers";
import skyline from "../../../assets/seattle-skyline.png";

export default function LimitedTimeOffersPage() {

    return (
        <section className="flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px] bg-cover bg-bottom" style={{ backgroundImage: `url(${skyline})` }}>
            <LimitedTimeOffers textColor="text-[#0C2D70]" />
        </section>
    );
}
