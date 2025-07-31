import React from 'react'
import RedirectionBack from '../RedirectionBack/RedirectionBack'

interface HeaderProps {
  backPath?: string
  navigationItems?: {
    path: string
    label: string
  }[]
  title: string
  description?: string
  actions?: {
    primaryAction: {
      title: string
      disabled?: boolean
      onClick: () => void
    }
    secondaryAction?: {
      disabled?: boolean
      title: string
      onClick: () => void
    }
  }
}

const Header: React.FC<HeaderProps> = ({
  description,
  backPath,
  title,
  actions
}) => {
  return (
    <div className="mb-4">
      {backPath && <RedirectionBack hrefBack={backPath} />}
      <div className=" md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 max-md:text-lg font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-base max-md:text-sm text-gray-500 font-medium">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="mt-4 max-md:mt-2 flex shrink-0 md:ml-4 md:mt-0">
            <button
              type="button"
              disabled={actions.primaryAction.disabled}
              onClick={actions.primaryAction.onClick}
              className="not-disabled:cursor-pointer disabled:opacity-60 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {actions.primaryAction.title}
            </button>
            {actions.secondaryAction && (
              <button
                type="button"
                disabled={actions.secondaryAction.disabled}
                onClick={actions.secondaryAction.onClick}
                className="ml-3 not-disabled:cursor-pointer disabled:opacity-60 inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {actions.secondaryAction.title}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
