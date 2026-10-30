// Classes reutilizadas pelos formulários e cartões do Ambiente de Estudo.

export const classeCartao =
  'bg-white border border-gray-100 rounded-2xl shadow-lg'

export const classeRotulo = 'block text-sm font-semibold text-gray-900'

export const classeAjuda = 'mt-1 text-xs text-gray-500'

export const classeCampo =
  'mt-1.5 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black disabled:bg-gray-50'

export const classeErro = 'mt-1 text-xs font-medium text-red-600'

/** Botão de opção em grade (tipos, formatos, dificuldades). */
export const classeOpcao = (selecionada: boolean) =>
  [
    'rounded-xl border p-3 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-black',
    selecionada
      ? 'border-black bg-gray-900 text-white'
      : 'border-gray-200 bg-white hover:border-gray-400'
  ].join(' ')
