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
            number: '1/3',
            label: 'Food Wasted Globally',
            description: 'While millions go hungry, one-third of all food produced is thrown away.',
            Icon: ArrowTrendingDownIcon,
        },
        {
            number: '828M',
            label: 'People Face Hunger',
            description: 'Enough food is produced to feed everyone, yet 1 in 9 people go to bed hungry.',
            Icon: UserGroupIcon,
        },
        {
            number: '1 Goal',
            label: 'Zero Hunger',
            description: 'Our mission is to bridge the gap between surplus and need, block by block.',
            Icon: GlobeAltIcon,
        },
        {
            number: 'Local',
            label: 'Community First',
            description: 'Empowering neighbors to solve local hunger instantly.',
            Icon: HeartIcon,
        },
        {
            number: '100%',
            label: 'Privacy Protected',
            description: 'We verify the food, not the face. Dignity is our priority.',
            Icon: ShieldCheckIcon,
        },
        {
            number: 'Fast',
            label: 'Hyper-Local Action',
            description: 'Connecting donors with spotters in minutes, not hours.',
            Icon: BoltIcon,
        }
    ];

    return (
        <section id="impact" className="py-20 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        The Reality & Our Mission
                    </h2>
                    <p className="text-lg text-gray-600 font-normal max-w-2xl mx-auto">
                        The food exists. The systems to share it do not. KindBite is building the bridge.
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
                            <span className="font-bold text-gray-900">We waste too much food.</span> Every day, millions of meals are thrown away. At the same time, millions of people go to bed hungry.
                        </p>
                        <p>
                            <span className="font-bold text-gray-900">KindBite connects us.</span> If you have extra food, you can share it instantly. We make it safe, fast, and private.
                        </p>
                        <p className="text-lg font-bold text-orange-600 pt-4">
                            We don’t need more food to end hunger. We just need to share what we have.
                        </p>
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-gray-900 hover:bg-black text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:-translate-y-0.5"
                    >
                        Join the Movement
                    </button>
                    <p className="mt-4 text-sm text-gray-500 font-normal">
                        Be among the first to make a difference.
                    </p>
                </div>
            </div>
        </section>
    );
}
