'use client'
import Header from '@/components/Header/Header'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { LuCoffee, LuRotateCcw, LuPlay, LuBrain, LuPause } from 'react-icons/lu'

type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'

const TABS_KEYS = {
  TIMER: 'TIMER',
  STATISTIC: 'STATISTIC'
}

const MODE_KEYS = {
  WORK: 'WORK',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK'
} as const

const MODE_NAVIGATION = [
  {
    key: MODE_KEYS.WORK,
    label: 'Foco',
    icon: LuBrain
  },
  {
    key: MODE_KEYS.SHORT_BREAK,
    label: 'Pausa',
    icon: LuCoffee
  },
  {
    key: MODE_KEYS.LONG_BREAK,
    label: 'Longa',
    icon: LuCoffee
  }
]

const MODE_HEADER = {
  [MODE_KEYS.WORK]: {
    label: 'Foco',
    icon: <LuBrain className="text-2xl" />
  },
  [MODE_KEYS.SHORT_BREAK]: {
    label: 'Pausa curta',
    icon: <LuCoffee className="text-2xl" />
  },
  [MODE_KEYS.LONG_BREAK]: {
    label: 'Pausa longa',
    icon: <LuCoffee className="text-2xl" />
  }
}

const TABS = [
  {
    label: 'Timer',
    key: TABS_KEYS.TIMER
  },
  {
    label: 'Estatísticas',
    key: TABS_KEYS.STATISTIC
  }
]

const TIMER_DURATIONS = {
  [MODE_KEYS.WORK]: 25 * 60,
  [MODE_KEYS.SHORT_BREAK]: 5 * 60,
  [MODE_KEYS.LONG_BREAK]: 15 * 60
}

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[MODE_KEYS.WORK])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTab, setCurrentTab] = useState(TABS_KEYS.TIMER)
  const [mode, setMode] = useState<TimerMode>(MODE_KEYS.WORK)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      setTimeLeft(TIMER_DURATIONS[MODE_KEYS.WORK])
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_DURATIONS[mode])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_DURATIONS[newMode])
    setIsRunning(false)
  }

  const progress =
    ((TIMER_DURATIONS[MODE_KEYS[mode]] - timeLeft) /
      TIMER_DURATIONS[MODE_KEYS[mode]]) *
    100

  return (
    <div>
      <div className="text-center">
        <Header
          title="Seja bem-vindo ao módulo Pomodoro, Lucas!"
          description="Estudo, foco e determinação!"
        />
      </div>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-xl space-y-4 shadow-lg p-1">
          <div className="grid grid-cols-2">
            {TABS.map(({ key, label }) => (
              <div
                onClick={() => setCurrentTab(key)}
                key={key}
                className={clsx(
                  'bg-white text-center cursor-pointer col-span-1 rounded-md text-base space-y-2 py-2 px-8',
                  {
                    'border border-gray-100 shadow-sm font-semibold':
                      currentTab === key,
                    'text-gray-600 font-medium': currentTab !== key
                  }
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
        <div
          hidden={currentTab !== 'TIMER'}
          className="w-xl mx-auto bg-white border border-gray-100 rounded-2xl space-y-8 shadow-lg p-6"
        >
          <span className="flex items-center justify-center gap-2">
            <div className="p-2 aspect-square bg-gray-200 rounded-full">
              {MODE_HEADER[MODE_KEYS[mode]].icon}
            </div>
            <h2 className="font-medium text-xl text-center">
              {MODE_HEADER[MODE_KEYS[mode]].label}
            </h2>
          </span>

          <p className="text-center text-7xl font-semibold">
            {formatTime(timeLeft)}
          </p>
          <div className="w-full rounded-full overflow-hidden bg-gray-200 h-2.5">
            <div
              className="bg-black h-full"
              style={{
                width: `${progress}%`
              }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {MODE_NAVIGATION.map((mode) => (
              <button
                key={mode.key}
                onClick={() => switchMode(mode.key)}
                type="button"
                className="w-full leading-none flex items-center gap-2 justify-center rounded-xl bg-gray-900 text-white px-3.5 py-3.5 cursor-pointer text-base font-semibold shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-800"
              >
                <mode.icon className="text-lg" />
                {mode.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={toggleTimer}
              className="w-full flex items-center gap-2 justify-center rounded-xl bg-gray-900 text-white px-3.5 py-3.5 cursor-pointer text-lg font-semibold shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-800"
            >
              {isRunning ? (
                <LuPause className="text-xl" />
              ) : (
                <LuPlay className="text-xl" />
              )}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={resetTimer}
              type="button"
              className="w-fit  flex justify-center items-center rounded-xl bg-white px-7 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <LuRotateCcw className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pomodoro
