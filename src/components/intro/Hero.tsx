'use client'

import { useRef } from 'react'
import { AlarmClockIcon, ArrowDownRight01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import Logo from '@/components/intro/Logo'
import AnimatedPath from '@/components/intro/AnimatedPath'
import ButtonPill from '@/components/ui/button-animated'
import styles from './hero.module.css'

gsap.registerPlugin(useGSAP, SplitText)


interface HeroProps {
  showBackground: boolean

}
export function Hero({ showBackground = true }: HeroProps) {

  const handleGetStarted = () => {
    const formSection = document.getElementById('how-it-works')
    formSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const titleVariant = {
    hidden: { x: "-100vw" },
    visible: {
      x: 0,
      transition: {
        delay: 2,
        when: "beforeChildren",
        staggerChildren: 0.5,
      },
    },
  }

  const titleTextVariant = {
    hidden: { filter: 'blur(10px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  }

  const actionsVariant = {
    hidden: { filter: 'blur(10px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  }

  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.set("h1", { opacity: 1 })
    const split = SplitText.create(".title", { type: "words, chars" })
    gsap.from(split.chars, {
      x: -10,
      autoAlpha: 0,
      stagger: 0.04
    })
  }, { scope: container })

  return (
    <section className={`${styles.hero} ${!showBackground ? styles.heroNoBackground : ''}`}>
      <div className={styles.logo}>
        <Logo variant="white" style={{ width: 'calc(var(--op-size-unit) * 24)', height: 'auto' }} />
      </div>
      <div className={`container ${styles.container}`}>
        <div ref={container}>
          <h1 id="heading" className={styles.title}>
            <span className="title">Is{` `}</span>
            <span className={styles['title-highlight']}>custom software</span>
            <div>
              <span className="title">right for{` `}</span>
              <span className={`title ${styles.circle}`}>your
                <AnimatedPath
                  className={styles['highlight-circle']}
                  stroke="var(--brand-Bright-Yellow)"
                  strokeWidth={4}
                  unit="%"
                  wunit="%"
                  height={110}
                  width={110}
                  speed={2}
                  delay={2}
                  trigger="in-view"
                  preserveAspectRatio="none"
                  d="M1 52.6501C115.88 -2.08648 483.388 1.16489 499.75 52.6501C510.213 85.5762 454.384 99.1037 355.471 112.631C256.559 126.159 48.5456 125.915 17.3586 92.0694C-20.5347 50.9459 89.9842 -1.65508 260.277 3.32941C519.086 10.9048 527.267 80.7065 459.59 112.631"
                />
              </span> <span className="title">business?</span>
            </div>
          </h1>
          <motion.div variants={titleVariant} initial="hidden" animate="visible">
            <motion.p className={styles.subtitle} variants={titleTextVariant}>
              Find out in a just few minutes. This A.I. tool helps you explore whether custom software makes sense for your business.
            </motion.p>

            <motion.div className={styles.actions} variants={actionsVariant}>
              <ButtonPill iconRight={<HugeiconsIcon icon={ArrowDownRight01Icon} strokeWidth={2} size={20} />} label="How it works" variant="brightblue" onClick={handleGetStarted}>
              </ButtonPill>
              <div className={styles['time-estimate']}>
                <HugeiconsIcon icon={AlarmClockIcon} size={20} />
                <span>Takes 3-5 minutes</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
