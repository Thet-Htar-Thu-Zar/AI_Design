import { X, Home, Settings, User } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <aside className={`fixed inset-y-0 left-0 w-64 transform bg-gray-800 p-5 ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform`}>
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
            </button>
            <nav className="mt-8">
                <img src="/fusion-logo.png" alt="fusion logo" className="h-12" />
                <div className="text-xl font-bold">Fusion Solution</div>
                <ul className="space-y-4">
                    <li className="mt-5 flex cursor-pointer items-center gap-2 pb-5 text-white hover:text-yellow-400">
                        <Home className="h-5 w-5" /> Home
                    </li>
                    <li className="mb-5 mt-5 flex cursor-pointer items-center gap-2 text-white hover:text-yellow-400">
                        <User className="h-5 w-5" /> Profile
                    </li>
                    <li className="mb-5 mt-5 flex cursor-pointer items-center gap-2 text-white hover:text-yellow-400">
                        <Settings className="h-5 w-5" /> Settings
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
