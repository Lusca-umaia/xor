'use client'
import EditableTitle from '@/components/EditableTitle/EditableTitle'
import Header from '@/components/Header/Header'
import TextEditorWithPrefix from '@/components/TextEditorWithPrefix/TextEditorWithPrefix'
import Image from 'next/image'
import { useState } from 'react'

const Questions = () => {
  const [state, setState] = useState('Título do documento')
  return (
    <div>
      <Header title="Criar lista de questões" />
      <div className="bg-gray-100 border border-gray-100 rounded-2xl space-y-4 p-6">
        <div className="w-5xl mx-auto bg-white border-2 min-h-[500px] border-gray-100 rounded-2xl space-y-4 shadow-md p-6">
          <div className="flex relative flex-col justify-between gap-2 w-full items-center">
            <Image
              src={'/simple_logo.png'}
              width={500}
              className="w-20 bottom-0 absolute right-0 h-auto self-center"
              quality={100}
              alt="logo"
              height={500}
            />
            <div className="flex-1 min-w-0">
              <EditableTitle
                title={state}
                handleChange={(value) => setState(value)}
              />
            </div>
          </div>
          {/* <div>
            <p className="font-semibold">Questões:</p>
            <TextEditorWithPrefix
              prefix={<span className="font-bold">1 - </span>}
              title={state}
              handleChange={(value) => setState(value)}
              type="SECTION_TITLE"
            />
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default Questions
