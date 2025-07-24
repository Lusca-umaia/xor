import { useEffect, useRef } from 'react'
import styles from './styles.module.scss'
import clsx from 'clsx'

const DEFAULT_TITLE = 'Título do documento'

interface EditableTitleProps {
  handleChange: (value: string) => void
  title: string
  disabled?: boolean
}

const EditableTitle = ({
  handleChange,
  title,
  disabled = false
}: EditableTitleProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value)
  }

  useEffect(() => {
    if (inputRef.current && textRef.current) {
      inputRef.current.style.width = `${textRef.current.getBoundingClientRect().width}px`
      inputRef.current.style.height = `${textRef.current.getBoundingClientRect().height}px`
    }
  }, [title])

  const handleBlur = () => {
    if (!title) {
      handleChange(DEFAULT_TITLE)
    }
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        value={title}
        onBlur={handleBlur}
        ref={inputRef}
        disabled={disabled}
        onChange={onChange}
        className={clsx(styles.editInput, 'text-2xl')}
      />
      <div className={styles.disabled}>
        <p ref={textRef} className={clsx(styles.titleText, 'text-2xl')}>
          {title}
          <br />
        </p>
      </div>
    </div>
  )
}

export default EditableTitle
