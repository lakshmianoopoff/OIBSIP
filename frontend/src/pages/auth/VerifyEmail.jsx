import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { verifyEmail } from '../../api/auth.api'
import Spinner from '../../components/ui/Spinner'

export default function VerifyEmail() {
    const { token } = useParams()
    const [status, setStatus] = useState('loading') // loading | success | error

    const mutation = useMutation({
        mutationFn: () => verifyEmail(token),
        onSuccess: () => setStatus('success'),
        onError: () => setStatus('error'),
    })

    useEffect(() => {
        if (token) mutation.mutate()
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full mx-4 bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Spinner size="lg" />
                        <p className="text-gray-500 text-sm">Verifying your email...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="text-5xl">✅</div>
                        <h2 className="text-xl font-semibold text-gray-900">Email verified!</h2>
                        <p className="text-gray-500 text-sm">
                            Your account is now active. You can sign in.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block mt-2 px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Go to login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="text-5xl">❌</div>
                        <h2 className="text-xl font-semibold text-gray-900">Verification failed</h2>
                        <p className="text-gray-500 text-sm">
                            This link is invalid or has expired. Please register again.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block mt-2 px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Back to register
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}