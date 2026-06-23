'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How does income verification work?',
    a: 'The tenant uploads their pay stub or bank statement. Our AI reads the document and compares the income to what they self-reported. If there is a discrepancy we flag it immediately.',
  },
  {
    q: 'What is the community database?',
    a: 'Landlords who use TenantIQ can rate tenants after their tenancy ends. Every new application is automatically checked against these reviews — matched by email, phone number, and name plus city. It gets more powerful as more landlords join.',
  },
  {
    q: 'Do tenants need to create an account?',
    a: 'No. You send them a link, they fill out a form. That is it. No app download, no account creation.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted at rest and in transit. We do not sell or share your data with third parties.',
  },
  {
    q: 'What if I only have one rental unit?',
    a: 'Perfect. TenantIQ is built for landlords with 1 to 100 units. Start free with 3 screenings and only pay when you need more.',
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden transition-all duration-200"
          style={{
            background: 'rgba(15,22,41,0.8)',
            border: `1px solid ${open === i ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          <button
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-slate-100 text-sm sm:text-base">{faq.q}</span>
            <ChevronDown
              className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: open === i ? '200px' : '0px' }}
          >
            <div className="px-6 pb-5">
              <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
