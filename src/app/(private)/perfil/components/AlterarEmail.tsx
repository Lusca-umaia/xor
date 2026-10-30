'use client'

import { useState } from 'react'
import { LuMail } from 'react-icons/lu'
import { Perfil } from '@/@types/Perfil'
import FormInput from '@/components/FormInput/FormInput'
import { useAlterarEmail } from '@/hooks/mutations/usePerfil'
import { alterarEmailSchema } from '@/lib/api/schemas'
import { getErrorMessage } from '@/services/api'
import CampoSenha from './CampoSenha'
import { Aviso, BOTAO_PRIMARIO, SecaoCard, errosPorCampo } from './SecaoCard'

const CAMPOS_VAZIOS = { email: '', senhaAtual: '' }

const AlterarEmail: React.FC<{ perfil: Perfil }> = ({ perfil }) => {
  const [campos, setCampos] = useState(CAMPOS_VAZIOS)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const alterar = useAlterarEmail()

  const handleChange = (campo: keyof typeof CAMPOS_VAZIOS, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
    if (!alterar.isIdle) alterar.reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = alterarEmailSchema.safeParse(campos)

    if (!result.success) {
      setErrors(errosPorCampo(result.error))
      return
    }

    setErrors({})
    alterar.mutate(result.data, {
      onSuccess: () => setCampos(CAMPOS_VAZIOS)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <SecaoCard
        icon={<LuMail />}
        titulo="Email"
        descricao="Usado para entrar na sua conta e para recuperar o acesso."
        rodape={
          <button
            type="submit"
            disabled={alterar.isPending}
            className={BOTAO_PRIMARIO}
          >
            {alterar.isPending ? 'Enviando...' : 'Alterar email'}
          </button>
        }
      >
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-100">
          <span className="font-semibold text-gray-900">Email atual</span>
          <span className="truncate text-gray-500">{perfil.email}</span>
        </div>

        {perfil.emailPendente && alterar.isIdle && (
          <Aviso tipo="pendente">
            Troca para <strong>{perfil.emailPendente}</strong> aguardando
            confirmação. Abra o link que enviamos para concluir.
          </Aviso>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            className="col-span-2 md:col-span-1"
            type="email"
            label="Novo email"
            name="novoEmail"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={campos.email}
            error={errors.email}
            handleChange={(value) => handleChange('email', value)}
          />
          <CampoSenha
            className="col-span-2 md:col-span-1"
            label="Senha atual"
            name="senhaAtualEmail"
            autoComplete="current-password"
            value={campos.senhaAtual}
            error={errors.senhaAtual}
            handleChange={(value) => handleChange('senhaAtual', value)}
          />
        </div>

        {alterar.isSuccess &&
          (alterar.data.emailPendente ? (
            <Aviso tipo="sucesso">
              Enviamos um link de confirmação para{' '}
              <strong>{alterar.data.emailPendente}</strong>. O email só muda
              depois que você abrir o link.
            </Aviso>
          ) : (
            <Aviso tipo="sucesso">Email atualizado.</Aviso>
          ))}
        {alterar.isError && (
          <Aviso tipo="erro">{getErrorMessage(alterar.error)}</Aviso>
        )}
      </SecaoCard>
    </form>
  )
}

export default AlterarEmail
