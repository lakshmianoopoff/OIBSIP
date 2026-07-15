import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { registerUser } from '../../api/auth.api'

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    const validate = () => {
        const newErrors = {}
        if (!form.name) newErrors.name = 'Name is required'
        if (!form.email) newErrors.email = 'Email is required'
        if (!form.password) newErrors.password = 'Password is required'
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        
        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            setSubmitted(true)
            toast.success('Registration successful! Please check your email.')
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Registration failed')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return
        const { name, email, password } = form
        mutation.mutate({ name, email, password })
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    if (submitted) {
        return (
            <AuthLayout title="Verify your email" subtitle="">
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            A verification link has been sent to <strong>{form.email}</strong>.
                            Please check your inbox to activate your account.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="block text-sm text-red-600 hover:underline"
                    >
                        ← Go to login page
                    </Link>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Get started building your perfect pizza"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    autoFocus
                />
                <Input
                    label="Email address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                />
                <Input
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                />

                <Button
                    type="submit"
                    fullWidth
                    loading={mutation.isPending}
                >
                    Sign up
                </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-red-600 font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    )
}