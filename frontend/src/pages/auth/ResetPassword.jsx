import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { resetPassword } from '../../api/auth.api'

export default function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ password: '', confirmPassword: '' })
    const [errors, setErrors] = useState({})

    const validate = () => {
        const newErrors = {}
        if (!form.password) newErrors.password = 'Password is required'
        else if (form.password.length < 6) newErrors.password = 'Minimum 6 characters'
        if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
        else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const mutation = useMutation({
        mutationFn: () => resetPassword(token, form.password),
        onSuccess: () => {
            toast.success('Password reset successfully')
            navigate('/login')
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Reset failed — link may have expired')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return
        mutation.mutate()
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    }

    return (
        <AuthLayout
            title="Set new password"
            subtitle="Choose a strong password for your account"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="New password"
                    name="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    autoFocus
                />
                <Input
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                />

                <Button
                    type="submit"
                    fullWidth
                    loading={mutation.isPending}
                >
                    Reset password
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