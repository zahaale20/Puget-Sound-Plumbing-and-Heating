import { useState } from "react";

import skyline from "../../../assets/seattle-skyline.png";

export default function CouponsPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        alert("Your message has been submitted!");
    };

    return (
        <div id="main">
            <section className="flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px] bg-cover bg-center" style={{ backgroundImage: `url(${skyline})` }}>
                <div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 gap-12">
                    {/* Left Column — Header + Form */}
                    <div className="flex flex-col w-full lg:w-1/2">
                        {/* Header */}
                        <div className="w-full mb-6 text-left">
                            <h3 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
                                Schedule Online
                                <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
                            </h3>
                            <p className="text-[#2B2B2B]">
                                We'll reach out to schedule your appointment.
                            </p>
                        </div>

                        {/* Contact Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 gap-4 text-left"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div>
                                    <label className="block font-bold">
                                        First Name{" "}
                                        <span className="text-[#B32020] font-normal italic">*</span>
                                    </label>
                                    <input className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block font-bold">
                                        Last Name{" "}
                                        <span className="text-[#B32020] font-normal italic">*</span>
                                    </label>
                                    <input className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phone */}
                                <div>
                                    <label className="block font-bold">
                                        Phone <span className="text-[#B32020] italic">*</span>
                                    </label>
                                    <input className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block font-bold">
                                        Email <span className="text-[#B32020] italic">*</span>
                                    </label>
                                    <input className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block font-bold">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D70] bg-white"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center mt-4">
                                <button type="submit" className="flex items-center rounded-lg px-6 py-3 text-base md:px-8 md:py-4 md:text-lg font-bold cursor-pointer transition-all duration-300 transform whitespace-nowrap h-[60px] text-white bg-[#B32020] hover:bg-[#7a1515] gap-2">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column — Map */}
                    <div className="w-full lg:w-1/2 overflow-hidden flex flex-col gap-6">
                        <iframe
                            title="Puget Sound Plumbing Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.5443320905326!2d-122.33776848438908!3d47.42335397916498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54906bf5ab7c2db5%3A0x9ad0c7a65a4d3c84!2s11803%20Des%20Moines%20Memorial%20Dr%20S%2C%20Seattle%2C%20WA%2098138!5e0!3m2!1sen!2sus!4v1700043600000!5m2!1sen!2sus"
                            className="w-full h-100 lg:h-full"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
