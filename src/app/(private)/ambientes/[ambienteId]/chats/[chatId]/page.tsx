'use client'

import { useParams } from 'next/navigation'
import JanelaChat from '@/components/AmbienteEstudo/Chat/JanelaChat'

export default function ChatPage() {
  const { ambienteId, chatId } = useParams<{
    ambienteId: string
    chatId: string
  }>()
  // A key remonta a janela ao trocar de chat, limpando rascunho e streaming.
  return <JanelaChat key={chatId} ambienteId={ambienteId} chatId={chatId} />
}
