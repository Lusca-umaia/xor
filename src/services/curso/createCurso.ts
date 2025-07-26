import api from '../api'

export async function createCurso(formData: any) {
  try {
    await api.post(`/curso`, formData)

    return {
      success: true,
      data: null,
      message: 'Curso criado com sucesso!'
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: 'Falha ao criar Curso!'
    }
  }
}
