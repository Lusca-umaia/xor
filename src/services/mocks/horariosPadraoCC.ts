// Horários padrão das disciplinas obrigatórias de Ciência da Computação (UFC), transcritos da
// "Grade de Horários" do curso: https://cc.ufc.br/pt/grade-de-horarios/ (consultada em
// 29/10/2026).
// ATENÇÃO: a página não informa a data de atualização e cita a oferta de 2019.1. Serve como
// SUGESTÃO; a turma do aluno pode ter outro horário (confira no SIGAA). Info. Soc. (CK0212)
// fica de fora: a própria página diz que o horário está "em transição".
// Dias no formato de Date.getDay(): 0 = domingo, 1 = segunda ... 6 = sábado.
export interface HorarioPadrao {
  dias: number[]
  inicio: string
  fim: string
}

const M1 = { inicio: '08:00', fim: '10:00' }
const M2 = { inicio: '10:00', fim: '12:00' }
const T1 = { inicio: '14:00', fim: '16:00' }

const SEG_QUA_SEX = [1, 3, 5]
const SEG_QUA = [1, 3]
const TER_QUI = [2, 4]
const QUA_SEX = [3, 5]

export const HORARIOS_PADRAO_CC: Record<string, HorarioPadrao[]> = {
  // 1º semestre
  CB0661: [{ dias: SEG_QUA_SEX, ...M1 }],
  CB0534: [{ dias: SEG_QUA_SEX, ...M2 }],
  CK0169: [
    { dias: [2], ...M1 },
    { dias: [3, 4], ...T1 }
  ],
  CK0211: [{ dias: TER_QUI, ...M2 }],
  CK0253: [{ dias: [4], ...M1 }],
  // 2º semestre
  CB0535: [{ dias: SEG_QUA_SEX, ...M1 }],
  CK0209: [{ dias: SEG_QUA, ...M2 }],
  CK0170: [{ dias: TER_QUI, ...M1 }],
  CK0226: [{ dias: TER_QUI, ...M2 }],
  CB0589: [{ dias: TER_QUI, ...T1 }],
  // 3º semestre
  CK0220: [{ dias: SEG_QUA_SEX, ...M2 }],
  CK0235: [{ dias: TER_QUI, ...M1 }],
  CC0261: [{ dias: TER_QUI, ...M2 }],
  CK0195: [{ dias: TER_QUI, ...T1 }],
  CK0111: [{ dias: QUA_SEX, ...M1 }],
  // 4º semestre
  CK0203: [{ dias: SEG_QUA, ...M1 }],
  CK0115: [{ dias: SEG_QUA_SEX, ...M2 }],
  CK0443: [{ dias: SEG_QUA_SEX, ...T1 }],
  CK0047: [{ dias: TER_QUI, ...M1 }],
  CK0245: [{ dias: TER_QUI, ...M2 }],
  // 5º semestre
  CK0249: [{ dias: SEG_QUA, ...M1 }],
  CK0095: [{ dias: SEG_QUA_SEX, ...M2 }],
  CK0247: [{ dias: TER_QUI, ...M1 }],
  CK0048: [{ dias: TER_QUI, ...M2 }],
  // 6º semestre
  CK0234: [{ dias: SEG_QUA_SEX, ...M2 }],
  CK0118: [{ dias: TER_QUI, ...M1 }],
  CK0192: [{ dias: TER_QUI, ...M2 }],
  CK0248: [{ dias: QUA_SEX, ...M1 }],
  // 7º semestre
  CK0096: [{ dias: SEG_QUA_SEX, ...M1 }],
  CK0202: [{ dias: SEG_QUA_SEX, ...M2 }]
}
