import api from '../api'

export async function getCursos() {
  try {
    const response = await api.get(`/curso`)

    return {
      success: true,
      data: response.data,
      message: 'Listagem obtida com sucesso!'
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      message: 'Falha ao buscar listagem!'
    }
  }
}

export async function getCurso(id: string) {
  try {
    const response = await api.get(`/curso/${id}`)

    return {
      success: true,
      data: response.data,
      message: 'Curso obtido com sucesso!'
    }
  } catch (error) {
    return {
      success: false,
      data: {},
      message: 'Falha ao buscar Curso!'
    }
  }
}
