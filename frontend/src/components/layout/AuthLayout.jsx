import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex">
            {/* Left panel — brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col justify-between p-12">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                        🍕 Pizza App
                    </h1>
                </div>
                <div className="space-y-4">
                    <p className="text-white text-4xl font-semibold leading-tight">
                        Fresh ingredients,<br />
                        built your way.
                    </p>
                    <p className="text-red-200 text-base">
                        Custom pizzas made to order — choose your base, sauce, cheese, and toppings.
                    </p>
                </div>
                <p className="text-red-300 text-sm">
                    © {new Date().getFullYear()} Pizza App
                </p>
            </div>

            {/* Right panel — form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8">
                    <Link to="/" className="text-red-600 text-xl font-bold">
                        🍕 Pizza App
                    </Link>
                </div>

                <div className="max-w-sm w-full">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
