"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '../../../supabase/client'
import { useRouter } from 'next/navigation'

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPassword() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) throw updateError
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting the password.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-4 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Password Updated</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your password has been successfully reset. Redirecting you...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Update Password</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 bg-transparent dark:text-white sm:text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 bg-transparent dark:text-white sm:text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
