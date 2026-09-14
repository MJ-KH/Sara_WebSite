'use client'

import { OtpLoginForm } from './OtpLoginForm'

export function AccountLoginGate() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-6 text-center text-xl font-bold">برای مشاهده حساب کاربری وارد شوید</h1>
      <OtpLoginForm onSuccess={() => window.location.reload()} />
    </div>
  )
}
