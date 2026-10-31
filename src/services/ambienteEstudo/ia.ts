import { StatusIa } from '@/@types/AmbienteEstudo'
import api from '../api'
import { dados } from './erros'

export const obterStatusIa = () => dados(api.get<StatusIa>('/ia/status'))
