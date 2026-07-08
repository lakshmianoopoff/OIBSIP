export default function Input({ label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all
          focus:ring-2 focus:ring-red-200 focus:border-red-400
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
        `}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}