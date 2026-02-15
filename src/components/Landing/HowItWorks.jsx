import {
    EyeIcon,
    MapPinIcon,
    BellAlertIcon,
    MapIcon,
    CameraIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function HowItWorks() {
    const steps = [
        { title: 'Spot Hunger', Icon: EyeIcon },
        { title: 'Drop Pin', Icon: MapPinIcon },
        { title: 'Alert Donors', Icon: BellAlertIcon },
        { title: 'Navigate to Spot', Icon: MapIcon },
        { title: 'Verify Delivery', Icon: CameraIcon },
        { title: 'Person Fed', Icon: CheckCircleIcon },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-gray-600 font-normal">
                        Six simple steps from hunger spotted to person fed
                    </p>
                </div>

                {/* Horizontal flow */}
                <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-8 md:gap-4 overflow-x-auto pb-4">
                    {steps.map((step, index) => {
                        const { Icon } = step;
                        return (
                            <div key={index} className="flex items-center gap-4 flex-shrink-0">
                                <div className="flex flex-col items-center w-24">
                                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                        <Icon className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 text-center leading-tight">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block text-gray-300 font-bold mb-8">→</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
