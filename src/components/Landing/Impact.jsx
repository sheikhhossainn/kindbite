import {
    GlobeAltIcon,
    BoltIcon,
    HeartIcon,
    ShieldCheckIcon,
    ArrowTrendingDownIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Impact() {
    const stats = [
        {
            number: '2,847',
            label: 'Meals Delivered',
            description: 'Hot meals delivered to people in need across 12 cities',
            Icon: UserGroupIcon,
        },
        {
            number: '563',
            label: 'Active Donors',
            description: 'Compassionate people ready to help at a moment\'s notice',
            Icon: HeartIcon,
        },
        {
            number: '12',
            label: 'Cities',
            description: 'Growing network from Dhaka to Delhi, Manila to Jakarta',
            Icon: GlobeAltIcon,
        },
        {
            number: '8 min',
            label: 'Avg Response',
            description: 'Average time from pin drop to donor acceptance',
            Icon: BoltIcon,
        },
        {
            number: '47%',
            label: 'Food Waste Cut',
            description: 'Reduction in surplus food going to waste among donors',
            Icon: ArrowTrendingDownIcon,
        },
        {
            number: '100%',
            label: 'Privacy Protected',
            description: 'Zero faces captured—AI verifies food only, always',
            Icon: ShieldCheckIcon,
        }
    ];

    return (
        <section id="impact" className="py-20 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Real Impact
                    </h2>
                    <p className="text-lg text-gray-600 font-normal max-w-2xl mx-auto">
                        Every action on KindBite creates measurable change. Here's the proof that kindness scales.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-20">
                    {stats.map((stat, index) => {
                        const { Icon } = stat;
                        return (
                            <div key={index} className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 icon-box text-orange-500">
                                    <Icon className="w-6 h-6" strokeWidth={2} />
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-base font-semibold text-gray-900 mb-2">{stat.label}</div>
                                <p className="text-sm text-gray-600 font-normal leading-relaxed max-w-xs">{stat.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Impact story - Simplified */}
                <div className="max-w-3xl mx-auto text-center bg-gray-50 rounded-3xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Why It Matters</h3>
                    <div className="space-y-4 text-gray-600 font-normal leading-relaxed">
                        <p>
                            <span className="font-semibold text-gray-900">The problem is urgent:</span> Globally, 1/3 of all food produced is wasted
                            while 800 million people face hunger. In dense cities, these two realities exist blocks apart—yet rarely connect.
                        </p>
                        <p>
                            <span className="font-semibold text-gray-900">KindBite changes this.</span> By making food rescue instant, hyper-local,
                            and privacy-first, we've removed every barrier between surplus and need.
                        </p>
                        <p className="text-lg font-semibold text-orange-600 pt-4">
                            Together, we've proven that ending hunger isn't about producing more food—it's about sharing what we already have.
                        </p>
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-gray-900 hover:bg-black text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:-translate-y-0.5"
                    >
                        Start Helping Now
                    </button>
                    <p className="mt-4 text-sm text-gray-500 font-normal">
                        Join 2,000+ neighbors sharing food today
                    </p>
                </div>
            </div>
        </section>
    );
}
