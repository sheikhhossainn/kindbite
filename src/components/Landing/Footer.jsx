export default function Footer() {
    return (
        <footer className="bg-white text-gray-500 py-8 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
                    <p>
                        &copy; {new Date().getFullYear()} KindBite. Designed in <span className="font-semibold text-orange-600">Bangladesh</span>.
                    </p>
                </div>
            </div>
        </footer>
    );
}
