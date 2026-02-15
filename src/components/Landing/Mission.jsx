export default function Mission() {
    return (
        <section id="mission" className="py-20 bg-gradient-to-b from-white to-orange-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Our <span className="text-gradient">Mission</span>
                </h2>
                <div className="prose prose-lg mx-auto text-gray-700 leading-relaxed">
                    <p className="text-xl mb-6">
                        KindBite exists to bridge the gap between food surplus and food insecurity in our communities.
                        Every day, restaurants and homes have extra food while people go hungry just blocks away—not
                        because there isn't enough food, but because there's no simple way to connect them.
                    </p>
                    <p className="text-lg text-gray-600">
                        We've built a hyper-local food rescue network that empowers anyone to make a difference.
                        Spotters on the street can report hunger with a single tap. Nearby donors get instant alerts
                        and can respond in minutes. Through privacy-first AI verification, we ensure accountability
                        while protecting everyone's dignity. <span className="font-semibold text-orange-600">Our goal is simple:
                            no one should go hungry when there's food to share.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
