import React, { ReactNode, useRef } from 'react'
import styles from './style.module.scss'
import clsx from 'clsx'

const TITLE_KEYS = {
  DOCUMENT_TITLE: 'DOCUMENT_TITLE',
  SECTION_TITLE: 'SECTION_TITLE',
  FIELD_TITLE: 'FIELD_TITLE'
} as const

const DEFAULT_TITLES = {
  [TITLE_KEYS.DOCUMENT_TITLE]: 'Título do documento',
  [TITLE_KEYS.SECTION_TITLE]: 'Título da seção',
  [TITLE_KEYS.FIELD_TITLE]: 'Título do campo'
} as const

interface TextEditorWithPrefixProps {
  type: keyof typeof TITLE_KEYS
  handleChange: (value: string) => void
  title: string
  defaultTitle?: string
  disabled?: boolean
  prefix: ReactNode
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

  const isDocumentTitle = type === TITLE_KEYS.DOCUMENT_TITLE
  const isSectionTitle = type === TITLE_KEYS.SECTION_TITLE
  const isFieldTitle = type === TITLE_KEYS.FIELD_TITLE

  const onBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    const currentText = e.currentTarget.innerText
    const processedValue = currentText

    if (!processedValue.trim()) {
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
          [styles.textDisabled]: disabled && !isViewMode,
          [styles.documentTitleText]: isDocumentTitle,
          [styles.sectionTitleText]: isSectionTitle,
          [styles.fieldTitleText]: isFieldTitle
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
