import type { Metadata } from "next"

import { LegalDocument, type LegalSection } from "@/components/legal-document"

export const metadata: Metadata = {
  title: "Privacy Policy | FreshTrace",
  description: "Starter privacy information for FreshTrace.",
}

const sections = [
  {
    title: "1. Who is responsible",
    body: "FreshTrace is operated by [legal organization name and address]. Privacy contact: [contact email]. Effective date: [date]. [Explain the respective responsibilities of the service operator and the organization using FreshTrace.]",
  },
  {
    title: "2. Information handled",
    body: "[Confirm the information actually collected, such as account names, work email addresses, organization memberships, and activity associated with quality records.] [Identify where that information comes from, which fields are required, and whether technical logs or device information are collected.]",
  },
  {
    title: "3. How information is used",
    body: "[Describe each actual purpose for using personal information, such as managing access, attributing record changes, providing support, and protecting the service.] [Document the applicable legal basis for each purpose where required.]",
  },
  {
    title: "4. Sharing and storage",
    body: "[List who can access personal information, including authorized organization members and service providers, and explain why.] [Confirm hosting locations, any international transfers, and the safeguards that apply.] Do not list providers or security commitments until they have been verified.",
  },
  {
    title: "5. Retention and browser storage",
    body: "[Set out how long each category of personal information is retained and how deletion is handled, including backups.] [Describe the cookies and browser storage actually used, their purposes and duration, and the choices available to users.]",
  },
  {
    title: "6. Your choices and questions",
    body: "Contact [privacy contact email] with questions about your information. [Explain applicable access, correction, deletion, objection, and complaint options, how requests are verified and handled, and how changes to this notice will be communicated.]",
  },
] satisfies LegalSection[]

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      introduction="This starter notice outlines the information that needs to be documented about how FreshTrace handles personal data."
      sections={sections}
    />
  )
}
