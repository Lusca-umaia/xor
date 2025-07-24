import CourseCard from '@/components/CourseCard/CourseCard'
import Header from '@/components/Header/Header'
import StatCard from '@/components/StatCard/StatCard'
import { GoGoal } from 'react-icons/go'
import { LuGraduationCap } from 'react-icons/lu'
import { FiClock } from 'react-icons/fi'
import { LuBookCheck } from 'react-icons/lu'
import { IoBookOutline } from 'react-icons/io5'

const CourseProgressionPage = () => {
  return (
    <div>
      <Header title="Olá, Lucas, veja o seu progresso!" />
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-lg p-6">
          <span className="text-2xl flex items-center gap-2">
            <LuGraduationCap className="text-4xl" />
            <div className="space-y-0.5">
              <h3 className="font-semibold leading-none tracking-tight">
                Ciência da Computação - CK2314
              </h3>
              <p className="text-base font-semibold">
                Matrícula: <span className="font-normal">555205</span>
              </p>
            </div>
          </span>
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Progresso geral"
              value="50.0%"
              icon={<GoGoal className="text-3xl text-blue-600" />}
            />
            <StatCard
              title="Obrigatórias"
              value="6/10"
              icon={<LuBookCheck className="text-3xl text-green-600" />}
            />
            <StatCard
              title="Optativas"
              value="2 concluídas"
              icon={<IoBookOutline className="text-3xl text-indigo-600" />}
            />
            <StatCard
              title="Carga horária"
              value="690h"
              icon={<FiClock className="text-3xl text-orange-600" />}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex justify-between gap-2">
              <p className="font-semibold">Disciplinas Obrigatórias</p>
              <p>1500/3000h</p>
            </span>
            <div className="w-full rounded-full overflow-hidden bg-gray-200 h-2.5">
              <div className="w-[50%]  bg-black h-full"></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex justify-between gap-2">
              <p className="font-semibold">Disciplinas Optativas</p>
              <p>150/300h</p>
            </span>
            <div className="w-full rounded-full overflow-hidden bg-gray-200 h-2.5">
              <div className="w-[50%]  bg-black h-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-lg p-6">
          <span className="text-xl flex items-center gap-2">
            <div className="flex gap-4 items-center">
              <h3 className="font-bold leading-none tracking-tight">
                1° Semestre
              </h3>
              <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                4/4 concluídas
              </span>
            </div>
          </span>
          <div className="grid grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <CourseCard
                  key={index}
                  nome="Cálculo I"
                  codigo="MAT001"
                  status="CONCLUIDA"
                  nota={7.5}
                />
              ))}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-lg p-6">
          <span className="text-xl flex items-center gap-2">
            <div className="flex gap-4 items-center">
              <h3 className="font-bold leading-none tracking-tight">
                2° Semestre
              </h3>
              <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                4/4 concluídas
              </span>
            </div>
          </span>
          <div className="grid grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <CourseCard
                  key={index}
                  nome="Cálculo II"
                  codigo="MAT001"
                  status="ANDAMENTO"
                />
              ))}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl space-y-4 shadow-lg p-6">
          <span className="text-xl flex items-center gap-2">
            <div className="flex gap-4 items-center">
              <h3 className="font-bold leading-none tracking-tight">
                3° Semestre
              </h3>
              <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                4/4 concluídas
              </span>
            </div>
          </span>
          <div className="grid grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <CourseCard
                  key={index}
                  nome="Cálculo III"
                  codigo="MAT001"
                  status="PENDENTE"
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseProgressionPage
