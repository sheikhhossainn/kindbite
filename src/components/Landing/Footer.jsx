export default function Footer() {
    return (
        <footer className="bg-white text-gray-500 py-8 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-wrap justify-between items-center text-xs">
                    <div className="flex gap-6 mb-4 md:mb-0">
                        <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
                        <a href="#resources" className="hover:text-gray-900 transition-colors">Resources</a>
                        <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
                        <a href="#blog" className="hover:text-gray-900 transition-colors">Blog</a>
                    </div>
                    <div>
                        © {new Date().getFullYear()} KindBite. Designed in California.
                    </div>
                </div>
            </div>
        </footer>
    );
}
