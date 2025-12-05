'use client'
import {
  Message02Icon,
  ArtificialIntelligence04Icon,
  DocumentAttachmentIcon,
  Calendar03Icon,
  ArrowDownRight01Icon,
} from '@hugeicons-pro/core-twotone-rounded'
import { HugeiconsIcon } from '@hugeicons/react'
import { Card } from '@/components/ui/card'
import ButtonPill from '@/components/ui/button-animated'
import styles from './how-it-works.module.css'

const steps = [
  {
    icon: Message02Icon,
    title: "Share what you're trying to accomplish",
    description:
      'In a few quick prompts, you\'ll outline the problem you\'re facing and what a win would look like for your business. No jargon, no prep required.',
    borderBottom: 'var(--brand-Bright-Blue)'
  },
  {
    icon: ArtificialIntelligence04Icon,
    title: 'See your situation from a new angle',
    description:
      'The tool helps you think through key considerations—like workflow gaps, integration needs, and potential pitfalls—while pointing you to resources that match your context.',
    borderBottom: 'var(--brand-Bright-Yellow)'
  },
  {
    icon: DocumentAttachmentIcon,
    title: 'Get a clear, structured overview',
    description:
      'You\'ll receive a simple, easy-to-read summary that highlights your goals, constraints, and what factors matter most as you evaluate custom software.',
    borderBottom: 'var(--brand-Medium-Green)'
  },
  {
    icon: Calendar03Icon,
    title: 'Choose what happens next',
    description:
      'If the timing and fit look right, you can book a consultation. If not, we\'ll provide helpful guidance and content so you can keep exploring at your own pace.',
    borderBottom: 'var(--blue-300)'
  },
]

export function HowItWorks() {
  const handleGetStarted = () => {
    const formSection = document.getElementById('get-started')
    formSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="how-it-works" className={styles['how-it-works']}>
      <div className={`container container--medium ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>How it works</h2>
          <p className={styles.subtitle}>
            A simple process to help you make an informed decision
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card
                key={step.title}
                className={`card ${styles.step}`}
                borderBottom={step.borderBottom}
                variant="dark"
              >
                <div className={styles['step-content']}>
                  <div className={styles['icon-wrapper']}>
                    <HugeiconsIcon icon={Icon} size={48} color="var(--op-color-white)" strokeWidth={1} />
                    <div
                      className={styles['step-number']}
                      style={{ backgroundColor: step.borderBottom }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <h4 className={styles['step-title']}>{step.title}</h4>
                  <p className={styles['step-description']}>{step.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <div className={styles.cta}>
          <ButtonPill
            label="Get started"
            iconRight={<HugeiconsIcon strokeWidth={2} icon={ArrowDownRight01Icon} size={20} />}
            variant="brightblue"
            onClick={handleGetStarted}
          />
        </div>
      </div>
    </section>
  )
}
