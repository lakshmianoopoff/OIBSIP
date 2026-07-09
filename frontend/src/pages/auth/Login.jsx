import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { loginUser } from '../../api/auth.api'
import useAuthStore from '../../store/authStore'

export default function Login() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((state) => state.setAuth)
    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})

    const validate = () => {
        const newErrors = {}
        if (!form.email) newErrors.email = 'Email is required'
        if (!form.password) newErrors.password = 'Password is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (res) => {
            const { accessToken, user } = res.data.data
            setAuth(user, accessToken)
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
            // Redirect based on role
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Login failed')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return
        mutation.mutate(form)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoFocus
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-red-600 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={mutation.isPending}
                >
                    Sign in
                </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-red-600 font-medium hover:underline">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    )
}