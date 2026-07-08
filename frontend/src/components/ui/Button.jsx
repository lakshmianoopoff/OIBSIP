export default function Button({
    children,
    variant = 'primary',
    loading = false,
    fullWidth = false,
    ...props
}) {
    const base = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-600 hover:bg-gray-100',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    }

    return (
        <button
            className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            )}
            {children}
        </button>
    )
}