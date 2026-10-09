'use client';

import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Target, Users, BookOpen, CheckCircle2 } from 'lucide-react';
import { COMPANY } from '@/config/company';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="bg-white px-4 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-indigo-700 uppercase">
              Our Mission
            </span>
          </div>
          <h1 className="font-display mb-6 text-4xl leading-tight font-black text-slate-900 md:text-6xl">
            Revolutionizing{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              MPPSC Prep
            </span>{' '}
            with Science.
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            We don&apos;t just give you Tests. We give you the{' '}
            <span className="font-semibold text-slate-800">memory hooks</span> to retain them
            forever. ZenScroll MPPSC is MP&apos;s bilingual mnemonic-based learning platform.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <p className="mb-2 text-xs font-bold tracking-widest text-indigo-600 uppercase">
              Company information
            </p>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              ZenScroll is built by {COMPANY.legalName}
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {COMPANY.productName} is an India-based education technology product operated by{' '}
              <strong className="text-slate-800">{COMPANY.legalName}</strong>. We are building
              digital learning tools for civil-services aspirants, beginning with bilingual syllabus
              resources, previous-year question analysis, practice tests, and structured
              answer-writing support for MPPSC.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Our product roadmap includes AI-assisted study workflows such as structured
              explanations, answer evaluation, and personalized practice. These workflows are
              being developed and tested; they are not presented as guarantees of exam results.
            </p>
            <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Product</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.productName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Business location</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.businessLocation}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Enterprise classification</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.enterpriseClassification}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Major activity</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.majorActivity}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Business activity</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.businessActivity}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Business commencement</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.commencementDate}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Udyam registration date</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.udyamRegistrationDate}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Udyam Registration Number</dt>
                <dd className="mt-1 text-slate-900">{COMPANY.udyamRegistrationNumber}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Business contact</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${COMPANY.contactEmail}`}
                    className="text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
                  >
                    {COMPANY.contactEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Founder &amp; Partnerships</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${COMPANY.founderEmail}`}
                    className="text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
                  >
                    {COMPANY.founderEmail}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Story / Problem-Solution */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-lg prose-slate mx-auto">
            <h2 className="font-display mb-6 text-3xl font-bold text-slate-900">
              Why we started ZenScroll MPPSC?
            </h2>
            <p className="mb-6 text-slate-600">
              The MPPSC syllabus is vast. History, Geography, Polity, MP GK, Ethics — the list goes
              on. Most aspirants spend 80% of their time <strong>reading</strong> and only 20%{' '}
              <strong>retaining</strong>.
            </p>
            <p className="mb-6 text-slate-600">
              We realized that the traditional way of rote memorization wasn&apos;t working. Students
              were forgetting key facts in the exam hall due to stress.
            </p>
            <p className="mb-8 text-slate-600">
              <strong>Enter Mnemonics.</strong> By linking dry facts to vivid stories and mental
              images, we turn information into long-term memory. Our platform is built on this core
              scientific principle.
            </p>

            <div className="not-prose mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Brain className="h-5 w-5 text-indigo-600" />
                The Mindful Advantage
              </h3>
              <ul className="space-y-3">
                {[
                  'Bilingual Content (English + Hindi) for maximum reach',
                  'Entire MPPSC syllabus Analysis for each topic',
                  'Smart Analytics to identify your weak spots instantly',
                  'Curated PYQs (Previous Year Questions) from last 5+ years',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-600 md:text-base"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display mb-6 text-3xl font-bold md:text-4xl">
            Ready to ace MPPSC 2026?
          </h2>
          <p className="mb-8 text-lg text-slate-400">
          Build a clearer MPPSC study workflow with structured practice and revision tools.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/pricing">
              <Button
                size="lg"
                className="h-12 w-full rounded-xl bg-white px-8 font-bold text-slate-900 hover:bg-slate-100 sm:w-auto"
              >
                View Plans
              </Button>
            </Link>
            <Link href="/syllabus/quiz/pyq">
              <Button
                size="lg"
                className="h-12 w-full rounded-xl border-slate-700 px-8 font-bold text-white hover:bg-slate-800 sm:w-auto"
              >
                Try Free Quiz
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
