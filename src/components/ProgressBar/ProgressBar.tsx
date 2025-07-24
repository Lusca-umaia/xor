import { FaCheck } from 'react-icons/fa'
import { classNames } from '@/utils/auxiliars'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { STEP_KEYS } from '@/helpers/consts'

const steps = [
  { name: 'Informações pessoais', stepName: STEP_KEYS.PERSONAL_INFORMATION },
  { name: 'Informações do curso', stepName: STEP_KEYS.COURSE_INFORMATION },
  { name: 'Informações do curso', stepName: 'teste' }
]

export default function Example() {
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
    <nav aria-label="Progress" className="mx-auto w-fit">
      <ol role="list" className="flex items-center">
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

// import { FaCheck } from 'react-icons/fa'

// const steps = [
//   { name: 'Informações pessoais', stepName: STEP_KEYS.PERSONAL_INFORMATION },
//   { name: 'Informações do curso', stepName: STEP_KEYS.COURSE_INFORMATION },
//   { name: 'Informações do curso', stepName: 'teste' }
// ]

// export default function Example() {
//   return (
//     <nav aria-label="Progress">
//       <ol
//         role="list"
//         className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
//       >
//         {steps.map((step, stepIdx) => (
//           <li key={step.name} className="relative md:flex md:flex-1">
//             {step.status === 'complete' ? (
//               <a href={step.href} className="group flex w-full items-center">
//                 <span className="flex items-center px-6 py-4 text-sm font-medium">
//                   <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
//                     <FaCheck aria-hidden="true" className="size-6 text-white" />
//                   </span>
//                   <span className="ml-4 text-sm font-medium text-gray-900">
//                     {step.name}
//                   </span>
//                 </span>
//               </a>
//             ) : step.status === 'current' ? (
//               <a
//                 href={step.href}
//                 aria-current="step"
//                 className="flex items-center px-6 py-4 text-sm font-medium"
//               >
//                 <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
//                   <span className="text-indigo-600">{step.id}</span>
//                 </span>
//                 <span className="ml-4 text-sm font-medium text-indigo-600">
//                   {step.name}
//                 </span>
//               </a>
//             ) : (
//               <a href={step.href} className="group flex items-center">
//                 <span className="flex items-center px-6 py-4 text-sm font-medium">
//                   <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
//                     <span className="text-gray-500 group-hover:text-gray-900">
//                       {step.id}
//                     </span>
//                   </span>
//                   <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
//                     {step.name}
//                   </span>
//                 </span>
//               </a>
//             )}

//             {stepIdx !== steps.length - 1 ? (
//               <>
//                 {/* Arrow separator for lg screens and up */}
//                 <div
//                   aria-hidden="true"
//                   className="absolute right-0 top-0 hidden h-full w-5 md:block"
//                 >
//                   <svg
//                     fill="none"
//                     viewBox="0 0 22 80"
//                     preserveAspectRatio="none"
//                     className="size-full text-gray-300"
//                   >
//                     <path
//                       d="M0 -2L20 40L0 82"
//                       stroke="currentcolor"
//                       vectorEffect="non-scaling-stroke"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </div>
//               </>
//             ) : null}
//           </li>
//         ))}
//       </ol>
//     </nav>
//   )
// }
