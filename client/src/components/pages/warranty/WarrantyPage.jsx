import Warranty from "../resources/components/Warranty";
import skyline from "../../../assets/seattle-skyline.png";

export default function WarrantyPage() {

    return (
        <section className="flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px] bg-cover bg-bottom" style={{ backgroundImage: `url(${skyline})` }}>
            <Warranty />
        </section>
    );
}
