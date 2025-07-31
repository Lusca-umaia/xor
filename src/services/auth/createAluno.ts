import { CadastroAluno } from '@/@types/aluno'
import api from '../api'

export async function createAluno(formData: CadastroAluno) {
  try {
    await api.post(`/aluno/`, formData)
  } catch (error) {
    console.log(error)
  } finally {
    return null
  }
}
