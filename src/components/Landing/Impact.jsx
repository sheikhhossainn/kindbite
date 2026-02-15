export default function Impact() {
    const stats = [
        {
            number: '2,847',
            label: 'Meals Delivered',
            description: 'Hot meals delivered to people in need across 12 cities',
            icon: '🍽️',
            color: 'from-orange-400 to-orange-600'
        },
        {
            number: '563',
            label: 'Active Donors',
            description: 'Compassionate people ready to help at a moment\'s notice',
            icon: '❤️',
            color: 'from-red-400 to-red-600'
        },
        {
            number: '12',
            label: 'Cities',
            description: 'Growing network from Dhaka to Delhi, Manila to Jakarta',
            icon: '🌍',
            color: 'from-green-400 to-green-600'
        },
        {
            number: '8 min',
            label: 'Avg Response',
            description: 'Average time from pin drop to donor acceptance',
            icon: '⚡',
            color: 'from-yellow-400 to-yellow-600'
        },
        {
            number: '47%',
            label: 'Food Waste Cut',
            description: 'Reduction in surplus food going to waste among donors',
            icon: '♻️',
            color: 'from-emerald-400 to-emerald-600'
        },
        {
            number: '100%',
            label: 'Privacy Protected',
            description: 'Zero faces captured—AI verifies food only, always',
            icon: '🔒',
            color: 'from-blue-400 to-blue-600'
        }
    ];

    return (
        <section id="impact" className="py-20 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Real <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Impact</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Every action on KindBite creates measurable change. Here's the proof that kindness scales.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="text-4xl font-bold mb-1">{stat.number}</div>
                                    <div className="text-lg font-semibold text-orange-400">{stat.label}</div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{stat.description}</p>
                        </div>
                    ))}
                </div>

                {/* Impact story */}
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg border border-orange-400/30 rounded-3xl p-10">
                    <h3 className="text-2xl font-bold mb-6 text-center">Why It Matters</h3>
                    <div className="space-y-4 text-gray-200 leading-relaxed">
                        <p>
                            <strong className="text-white">The problem is urgent:</strong> Globally, 1/3 of all food produced is wasted
                            while 800 million people face hunger. In dense cities, these two realities exist blocks apart—yet rarely connect.
                        </p>
                        <p>
                            <strong className="text-white">KindBite changes this.</strong> By making food rescue instant, hyper-local,
                            and privacy-first, we've removed every barrier between surplus and need. No apps to download for recipients.
                            No paperwork. No shame. Just human kindness, tech-enabled.
                        </p>
                        <p className="text-xl font-semibold text-orange-300 text-center pt-4">
                            Together, we've proven that ending hunger isn't about producing more food—it's about sharing what we already have.
                        </p>
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-16 text-center">
                    <p className="text-2xl mb-6 text-gray-200">
                        Join <span className="text-orange-400 font-bold">563 donors</span> making a difference today
                    </p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 text-lg"
                    >
                        Start Helping Now
                    </button>
                </div>
            </div>
        </section>
    );
}
