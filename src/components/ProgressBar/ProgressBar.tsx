import { FaCheck } from 'react-icons/fa'
import { classNames } from '@/utils/auxiliars'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { STEP_KEYS } from '@/helpers/consts'

const steps = [
  { name: 'Informações pessoais', stepName: STEP_KEYS.PERSONAL_INFORMATION },
  { name: 'Informações do curso', stepName: STEP_KEYS.COURSE_INFORMATION },
  {
    name: 'Informações do semestre atual',
    stepName: STEP_KEYS.CURRENT_SEMESTER
  }
]

export default function ProgressBar() {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get('step') as keyof typeof STEP_KEYS

  const currentStepNumber = useMemo(() => {
    return steps.findIndex((step) => step.stepName === currentStep)
  }, [currentStep])

  const stepHasBeenCompleted = useCallback(
    (stepIndex: number) => {
      return stepIndex < currentStepNumber
    },
    [currentStepNumber]
  )

  return (
    <nav className="mx-auto w-fit">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.stepName}
            className={classNames(
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative'
            )}
          >
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <div
                  className={classNames(
                    'h-0.5 w-full',
                    stepHasBeenCompleted(stepIdx)
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  )}
                />
              </div>
              <div
                className={classNames(
                  'relative flex size-8 items-center justify-center border-2 rounded-full',
                  stepHasBeenCompleted(stepIdx) ? 'bg-indigo-600' : 'bg-white',
                  stepHasBeenCompleted(stepIdx) || currentStep === step.stepName
                    ? 'border-indigo-600'
                    : 'border-gray-300'
                )}
              >
                {stepHasBeenCompleted(stepIdx) ? (
                  <FaCheck aria-hidden="true" className="size-4 text-white" />
                ) : (
                  <span
                    aria-hidden="true"
                    className={classNames(
                      'size-2.5 rounded-full',
                      currentStep === step.stepName
                        ? 'bg-indigo-600'
                        : 'bg-gray-200'
                    )}
                  />
                )}

                <span className="sr-only">{step.name}</span>
              </div>
            </>
          </li>
        ))}
      </ol>
    </nav>
  )
}
