const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Review']

export default function StepIndicator({ currentStep }) {
    return (
        <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => {
                const stepNum = index + 1
                const isCompleted = currentStep > stepNum
                const isActive = currentStep === stepNum

                return (
                    <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`
                h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${isCompleted ? 'bg-red-600 text-white'
                                    : isActive ? 'bg-red-600 text-white ring-4 ring-red-100'
                                        : 'bg-gray-100 text-gray-400'}
              `}>
                                {isCompleted ? '✓' : stepNum}
                            </div>
                            <span className={`text-xs ${isActive ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`h-0.5 w-12 sm:w-24 mx-2 mb-5 transition-all ${isCompleted ? 'bg-red-600' : 'bg-gray-200'
                                }`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}