import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { forgotPassword } from '../../api/auth.api'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const mutation = useMutation({
        mutationFn: () => forgotPassword(email),
        onSuccess: () => setSubmitted(true),
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Something went wrong')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!email) return toast.error('Please enter your email')
        mutation.mutate()
    }

    if (submitted) {
        return (
            <AuthLayout title="Check your email" subtitle="">
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            If an account exists for <strong>{email}</strong>, a reset link has been sent.
                            Check your inbox.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="block text-sm text-red-600 hover:underline"
                    >
                        ← Back to login
                    </Link>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="Enter your email and we'll send you a reset link"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                />

                <Button
                    type="submit"
                    fullWidth
                    loading={mutation.isPending}
                >
                    Send reset link
                </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
                Remember your password?{' '}
                <Link to="/login" className="text-red-600 font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    )
}