"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

const SampleSearchContext = createContext({
  query: "",
  reportQuery: "",
  setReportQuery: (_query: string) => {},
  setQuery: (_query: string) => {},
})

export function SampleSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("")
  const [reportQuery, setReportQuery] = useState("")
  return (
    <SampleSearchContext.Provider
      value={{ query, setQuery, reportQuery, setReportQuery }}
    >
      {children}
    </SampleSearchContext.Provider>
  )
}

export function useSampleSearch() {
  return useContext(SampleSearchContext)
}
