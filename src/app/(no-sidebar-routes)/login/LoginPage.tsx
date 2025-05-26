'use client';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'
import './login.css'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState(searchParams.message || '')

  useEffect(() => {
    if (searchParams.message) {
      const passwordInput = document.getElementById('password') as HTMLInputElement
      if (passwordInput) passwordInput.value = ''
    }
  }, [searchParams.message])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const result = await login(formData)

    if (result?.error) {
      setErrorMessage(result.error)
    } else {
      router.push('/home')
    }
  }

  return (
    <div id="login-page">
      <form onSubmit={handleSubmit}>
        <h1>Welcome To Amatra</h1>
        {errorMessage && (
          <div id="error-message">
            {errorMessage}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
        </div>
        <div className="button-group">
          <button className="primary-button" type="submit">Log in</button>
        </div>
      </form>
    </div>
  )
}
