import React, { ReactNode, useRef } from 'react'
import styles from './style.module.scss'
import clsx from 'clsx'

const TITLE_KEYS = {
  QUESTIONARIO_TITLE: 'QUESTIONARIO_TITLE',
  QUESTAO_TITLE: 'QUESTAO_TITLE',
  OPCAO_TITLE: 'OPCAO_TITLE'
} as const

const DEFAULT_TITLES = {
  [TITLE_KEYS.QUESTIONARIO_TITLE]: 'Título do questionário',
  [TITLE_KEYS.QUESTAO_TITLE]: 'Título da seção',
  [TITLE_KEYS.OPCAO_TITLE]: 'Título do campo'
} as const

interface TextEditorWithPrefixProps {
  type: keyof typeof TITLE_KEYS
  handleChange: (value: string) => void
  title: string
  defaultTitle?: string
  disabled?: boolean
  prefix?: ReactNode
  isViewMode?: boolean
}

const TextEditorWithPrefix = ({
  handleChange,
  prefix,
  type,
  title,
  defaultTitle,
  disabled = false,
  isViewMode = false
}: TextEditorWithPrefixProps) => {
  const textRef = useRef<HTMLParagraphElement>(null)

  const isQuestionarioTitle = type === TITLE_KEYS.QUESTIONARIO_TITLE
  const isQuestaoTitle = type === TITLE_KEYS.QUESTAO_TITLE
  const isOpcaoTitle = type === TITLE_KEYS.OPCAO_TITLE

  const onBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    const currentText = e.currentTarget.innerText
    const processedValue = currentText

    if (!processedValue.trim()) {
      textRef.current!.textContent = defaultTitle ?? DEFAULT_TITLES[type]
      handleChange(defaultTitle ?? DEFAULT_TITLES[type])
    } else {
      handleChange(processedValue)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div
        suppressContentEditableWarning
        className={clsx(styles.titleText, {
          [styles.questionarioTitleText]: isQuestionarioTitle,
          [styles.questaoTitleText]: isQuestaoTitle,
          [styles.opcaoTitleText]: isOpcaoTitle
        })}
      >
        <span>{prefix}</span>
        <span
          onBlur={onBlur}
          ref={textRef}
          className="outline-none"
          suppressContentEditableWarning
          contentEditable={disabled || isViewMode ? false : 'plaintext-only'}
        >
          {title}
        </span>
      </div>
    </div>
  )
}

export default TextEditorWithPrefix
