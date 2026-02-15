export default function HowItWorks() {
    const steps = [
        {
            number: 1,
            title: 'See Hunger',
            subtitle: 'Spotter',
            description: 'You see someone in need on the street. Open KindBite and tap the orange "Report Hunger" button.',
            icon: '👁️',
            details: [
                'Your GPS location is automatically captured',
                'Select urgency: Immediate, Moderate, or Low',
                'Add a brief note (e.g., "Elderly man near pharmacy")',
                'Set time-to-live (how long the person will be there)'
            ]
        },
        {
            number: 2,
            title: 'Pin Drops',
            subtitle: 'System',
            description: 'A red pin appears on the map at your exact location, visible to all nearby donors.',
            icon: '📍',
            details: [
                'Red pin = Urgent help needed',
                'System calculates nearest 5 donors within radius',
                'Push notifications sent instantly',
                'Countdown timer starts based on time-to-live'
            ]
        },
        {
            number: 3,
            title: 'Donor Responds',
            subtitle: 'Donor',
            description: 'A donor within 200m gets notified, packs food, and clicks "I Can Help" to reserve the request.',
            icon: '🤝',
            details: [
                'Pin turns green (reserved for this donor)',
                'Other donors see pin disappear (prevents duplicates)',
                '45-minute delivery countdown begins',
                'Built-in navigation guides donor to location'
            ]
        },
        {
            number: 4,
            title: 'Navigate & Deliver',
            subtitle: 'Geofencing',
            description: 'Donor follows GPS navigation. The app tracks proximity—"Complete Delivery" unlocks at 20 meters.',
            icon: '🗺️',
            details: [
                'Real-time distance tracking',
                'Geofence prevents early completion (anti-fraud)',
                'Visual cues show when donor is approaching',
                'Button activates only when genuinely close'
            ]
        },
        {
            number: 5,
            title: 'Verify Delivery',
            subtitle: 'Privacy-First AI',
            description: 'Donor hands over food and takes a photo. AI verifies food/container is visible—not faces.',
            icon: '📸',
            details: [
                'Camera opens with privacy reminder overlay',
                'TensorFlow.js scans image in-browser (no upload)',
                'AI detects food/container, rejects faces or unrelated objects',
                'Image deleted immediately after verification'
            ]
        },
        {
            number: 6,
            title: 'Mission Complete',
            subtitle: 'Rewards & Impact',
            description: 'Donor earns +50 Karma points. Spotter gets notified. Pin disappears. Someone is fed.',
            icon: '✅',
            details: [
                'Donor receives Karma points for leaderboard',
                'Spotter gets "Person you spotted was fed" notification',
                'Pin auto-deletes from map after 7 days (privacy)',
                'Impact stats updated in real-time'
            ]
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        How It <span className="text-gradient">Works</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        From spotting hunger to verified delivery—here's the complete journey of a KindBite rescue
                    </p>
                </div>

                {/* Step-by-step flow */}
                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute left-8 top-24 w-1 h-full bg-gradient-to-b from-orange-200 to-transparent"></div>
                            )}

                            {/* Step card */}
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Icon & Number */}
                                <div className="flex-shrink-0 relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg relative z-10">
                                        {step.icon}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {step.number}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 glass-card p-6">
                                    <div className="mb-3">
                                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-2">
                                            {step.subtitle}
                                        </span>
                                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4 text-lg">{step.description}</p>

                                    {/* Details list */}
                                    <ul className="space-y-2">
                                        {step.details.map((detail, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="text-orange-500 mt-1">→</span>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Visual summary */}
                <div className="mt-16 p-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl">
                    <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">The Complete Flow</h3>
                    <div className="flex flex-wrap justify-center items-center gap-4 text-center">
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">👤</div>
                            <div className="text-sm font-medium text-gray-700">Spotter Sees<br />Hunger</div>
                        </div>
                        <div className="text-2xl text-orange-500 hidden sm:block">→</div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">📍</div>
                            <div className="text-sm font-medium text-gray-700">Pin Drops<br />on Map</div>
                        </div>
                        <div className="text-2xl text-orange-500 hidden sm:block">→</div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">🔔</div>
                            <div className="text-sm font-medium text-gray-700">Donors<br />Notified</div>
                        </div>
                        <div className="text-2xl text-orange-500 hidden sm:block">→</div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">🚶</div>
                            <div className="text-sm font-medium text-gray-700">Navigation<br />to Spot</div>
                        </div>
                        <div className="text-2xl text-orange-500 hidden sm:block">→</div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">📸</div>
                            <div className="text-sm font-medium text-gray-700">AI Verify<br />Delivery</div>
                        </div>
                        <div className="text-2xl text-orange-500 hidden sm:block">→</div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">✅</div>
                            <div className="text-sm font-medium text-gray-700">Person<br />Fed</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
