import Link from 'next/link'
import React from 'react'
import { FaChevronRight } from 'react-icons/fa6'

interface HeaderProps {
  navigationItems?: {
    path: string
    label: string
  }[]
  title: string
  description?: string
  actions?: {
    primaryAction: {
      title: string
      onClick: () => void
    }
    secondaryAction?: {
      title: string
      onClick: () => void
    }
  }
}

const Header: React.FC<HeaderProps> = ({
  description,
  navigationItems,
  title,
  actions
}) => {
  return (
    <div className="mb-4">
      <div>
        {navigationItems && (
          <nav className="flex">
            <ol className="flex items-center space-x-4">
              {navigationItems.map(({ label, path }, index) => (
                <li key={path}>
                  <div className="flex items-center">
                    {index > 0 && index < navigationItems.length && (
                      <FaChevronRight className="mr-4 text-gray-400" />
                    )}
                    <Link
                      href={path}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {label}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      <div className="mt-3 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-base text-gray-500 font-medium">{description}</p>
          )}
        </div>
        {actions && (
          <div className="mt-4 flex shrink-0 md:ml-4 md:mt-0">
            <button
              type="button"
              onClick={actions.primaryAction.onClick}
              className="cursor-pointer inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {actions.primaryAction.title}
            </button>
            {actions.secondaryAction && (
              <button
                type="button"
                onClick={actions.secondaryAction.onClick}
                className="ml-3 cursor-pointer inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
