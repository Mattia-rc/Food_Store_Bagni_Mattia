import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Campo, Card, EstadoError, Input } from '../../../shared/ui/primitives'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../api/auth'

interface AuthField {
  name: 'username' | 'full_name' | 'email' | 'password'
  label: string
  autoComplete: string
  validate: (value: string) => string | undefined
}

const username: AuthField = {
  name: 'username', label: 'Usuario', autoComplete: 'username',
  validate: (value) => value.trim().length > 0 && value.trim().length <= 100 ? undefined : 'Ingresá un usuario de hasta 100 caracteres.',
}
const loginPassword: AuthField = {
  name: 'password', label: 'Contraseña', autoComplete: 'current-password',
  validate: (value) => value.length ? undefined : 'Ingresá tu contraseña.',
}
const registerFields: AuthField[] = [
  username,
  { name: 'full_name', label: 'Nombre completo', autoComplete: 'name',
    validate: (value) => value.trim().length > 0 && value.trim().length <= 150 ? undefined : 'Ingresá tu nombre completo.' },
  { name: 'email', label: 'Correo electrónico', autoComplete: 'email',
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : 'Ingresá un correo válido.' },
  { ...loginPassword, autoComplete: 'new-password',
    validate: (value) => value.length >= 8 && new TextEncoder().encode(value).length <= 72 ? undefined : 'Usá al menos 8 caracteres y hasta 72 bytes.' },
]

function AuthPage({ registro }: { registro: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState<unknown>(null)
  const mutation = useMutation({ mutationFn: authApi.register })
  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        if (registro) {
          await mutation.mutateAsync({ ...value, email: value.email.trim() })
          navigate('/login', { replace: true, state: { registrado: true } })
        } else {
          const usuario = await login(value.username.trim(), value.password)
          const from: unknown = location.state?.from
          const destino = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
            ? from : usuario.role === 'admin' ? '/admin/resumen' : '/'
          navigate(destino, { replace: true })
        }
      } catch (err) {
        setError(err)
      }
    },
  })
  return <Card className="form-card auth-card">
    <h1>{registro ? 'Creá tu cuenta' : 'Ingresá a tu cuenta'}</h1>
    {!registro && location.state?.registrado && <p className="success" role="status">Tu cuenta está lista. Ya podés ingresar.</p>}
    <form noValidate className="stack" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
      {(registro ? registerFields : [username, loginPassword]).map((config) => <form.Field
        key={config.name} name={config.name} validators={{ onSubmit: ({ value }) => config.validate(value) }}>
        {(field) => <Campo label={config.label} error={field.state.meta.errors[0]}>
          <Input name={field.name} value={field.state.value} onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)} autoComplete={config.autoComplete}
            type={config.name === 'password' ? 'password' : config.name === 'email' ? 'email' : 'text'} />
        </Campo>}
      </form.Field>)}
      <EstadoError error={error} />
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(pending) => <Button type="submit" disabled={pending}>{registro ? 'Crear cuenta' : 'Ingresar'}</Button>}
      </form.Subscribe>
    </form>
    <p className="muted">{registro ? '¿Ya tenés cuenta?' : '¿Es tu primera vez?'}{' '}
      <Link className="text-link" to={registro ? '/login' : '/register'}>{registro ? 'Iniciá sesión' : 'Registrate'}</Link>
    </p>
  </Card>
}

export function LoginPage() { return <AuthPage registro={false} /> }
export function RegisterPage() { return <AuthPage registro /> }

export function UnauthorizedPage() {
  return <Card className="form-card">
    <h1>Acceso restringido</h1>
    <p className="muted">Tu cuenta no tiene permiso para abrir esta página.</p>
    <Link className="button" to="/">Volver al menú</Link>
  </Card>
}
