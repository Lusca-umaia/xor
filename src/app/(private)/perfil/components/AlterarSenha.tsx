'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { LuKeyRound } from 'react-icons/lu'
import { useAlterarSenha } from '@/hooks/mutations/usePerfil'
import { alterarSenhaSchema } from '@/lib/api/schemas'
import { getErrorMessage } from '@/services/api'
import CampoSenha from '@/components/CampoSenha/CampoSenha'
import { Aviso, BOTAO_PRIMARIO, SecaoCard, errosPorCampo } from './SecaoCard'

const CAMPOS_VAZIOS = { senhaAtual: '', novaSenha: '', confirmacao: '' }

const NIVEIS = [
  { label: 'Fraca', cor: 'bg-red-500', texto: 'text-red-600' },
  { label: 'Razoável', cor: 'bg-amber-400', texto: 'text-amber-600' },
  { label: 'Boa', cor: 'bg-xor-lime', texto: 'text-lime-700' },
  { label: 'Forte', cor: 'bg-emerald-500', texto: 'text-emerald-600' }
]

// Pontuação simples: tamanho e variedade de caracteres. Retorna 0 a 3.
function forcaDaSenha(senha: string) {
  if (senha.length < 6) return 0
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (senha.length >= 12) pontos++
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++
  if (/\d/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  return Math.min(NIVEIS.length - 1, Math.max(0, pontos - 1))
}

const MedidorForca: React.FC<{ senha: string }> = ({ senha }) => {
  const nivel = forcaDaSenha(senha)
  const { label, cor, texto } = NIVEIS[nivel]

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="grid flex-1 grid-cols-4 gap-1">
        {NIVEIS.map((_, i) => (
          <span
            key={i}
            className={clsx(
              'h-1.5 rounded-full transition-colors duration-300',
              i <= nivel ? cor : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <span className={clsx('w-16 text-right text-xs font-semibold', texto)}>
        {label}
      </span>
    </div>
  )
}

const AlterarSenha = () => {
  const [campos, setCampos] = useState(CAMPOS_VAZIOS)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const alterar = useAlterarSenha()

  const handleChange = (campo: keyof typeof CAMPOS_VAZIOS, valor: string) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
    if (!alterar.isIdle) alterar.reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = alterarSenhaSchema.safeParse(campos)
    const fieldErrors = result.success ? {} : errosPorCampo(result.error)

    if (campos.confirmacao !== campos.novaSenha) {
      fieldErrors.confirmacao = 'As senhas não conferem'
    }

    if (!result.success || fieldErrors.confirmacao) {
      setErrors(fieldErrors)
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
        icon={<LuKeyRound />}
        titulo="Senha"
        descricao="Use pelo menos 8 caracteres, misturando letras, números e símbolos."
        rodape={
          <button
            type="submit"
            disabled={alterar.isPending}
            className={BOTAO_PRIMARIO}
          >
            {alterar.isPending ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <CampoSenha
            className="col-span-2 md:col-span-1"
            label="Senha atual"
            name="senhaAtual"
            autoComplete="current-password"
            value={campos.senhaAtual}
            error={errors.senhaAtual}
            handleChange={(value) => handleChange('senhaAtual', value)}
          />
          <div className="max-md:hidden" />
          <CampoSenha
            className="col-span-2 md:col-span-1"
            label="Nova senha"
            name="novaSenha"
            autoComplete="new-password"
            value={campos.novaSenha}
            error={errors.novaSenha}
            handleChange={(value) => handleChange('novaSenha', value)}
          >
            {campos.novaSenha && <MedidorForca senha={campos.novaSenha} />}
          </CampoSenha>
          <CampoSenha
            className="col-span-2 md:col-span-1"
            label="Confirmar nova senha"
            name="confirmacao"
            autoComplete="new-password"
            value={campos.confirmacao}
            error={errors.confirmacao}
            handleChange={(value) => handleChange('confirmacao', value)}
          />
        </div>

        {alterar.isSuccess && (
          <Aviso tipo="sucesso">
            Senha atualizada. Use a nova senha no próximo login.
          </Aviso>
        )}
        {alterar.isError && (
          <Aviso tipo="erro">{getErrorMessage(alterar.error)}</Aviso>
        )}
      </SecaoCard>
    </form>
  )
}

export default AlterarSenha
