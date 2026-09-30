import type { Metadata } from "next"

import { LegalDocument, type LegalSection } from "@/components/legal-document"

export const metadata: Metadata = {
  title: "Terms of Service | FreshTrace",
  description: "Starter terms for using FreshTrace.",
}

const sections = [
  {
    title: "1. About these terms",
    body: "FreshTrace is provided by [legal organization name], located at [business address]. These terms cover access to the service for dairy quality workflows. Effective date: [date]. Confirm the service scope and who may accept these terms on behalf of an organization.",
  },
  {
    title: "2. Accounts and access",
    body: "Use only an account you are authorized to access. Keep your sign-in details private and report suspected unauthorized access to [support contact]. Your organization is responsible for identifying the people who should have access and requesting changes when their responsibilities change.",
  },
  {
    title: "3. Responsible use",
    body: "Enter information accurately and only share records you have permission to use. Do not attempt to access another organization's data, disrupt the service, or bypass access controls. Follow your organization's approved quality procedures when recording and reviewing results.",
  },
  {
    title: "4. Records and decisions",
    body: "FreshTrace supports recording and reviewing quality information. Users remain responsible for checking records and following approved procedures before making operational decisions. [Describe ownership of submitted records, permitted use, export options, and responsibilities for correcting errors.]",
  },
  {
    title: "5. Service changes and ending access",
    body: "[Describe support availability, maintenance, any charges, and how changes to the service or these terms will be communicated.] [Specify when access may be suspended or ended and how records can be exported or removed afterward.]",
  },
  {
    title: "6. Other terms and contact",
    body: "[Add applicable governing law, dispute resolution, and any appropriate warranty and liability terms after review.] For questions about these terms, contact [legal contact email].",
  },
] satisfies LegalSection[]

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      introduction="These starter terms describe the intended responsibilities of people and organizations using FreshTrace."
      sections={sections}
    />
  )
}
