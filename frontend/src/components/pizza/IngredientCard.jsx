export default function IngredientCard({ ingredient, selected, onSelect, multi = false }) {
    const isSelected = multi
        ? selected.includes(ingredient.name)
        : selected === ingredient.name

    const unavailable = !ingredient.isAvailable

    return (
        <button
            onClick={() => !unavailable && onSelect(ingredient)}
            disabled={unavailable}
            className={`
        relative w-full p-4 rounded-xl border-2 text-left transition-all
        ${isSelected
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
        ${unavailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">{ingredient.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {ingredient.price === 0 ? 'Included' : `+₹${ingredient.price}`}
                    </p>
                </div>
                {isSelected && (
                    <span className="text-red-500 text-lg">✓</span>
                )}
                {unavailable && (
                    <span className="text-xs text-gray-400">Out of stock</span>
                )}
            </div>
        </button>
    )
}