export type SampleRegistration = {
  productType: FinalProductType | ""
  sourceId: string
  description: string
  volume: string
  equipment: string
  temperature: string
  receiptTime: string
  integrity: string
  analysis: string
  sampler: string
  receivedBy: string
}

export type SampleIdentity = {
  id: string
  createdAt: string
}

export type SampleSource = {
  id: string
  name: string
  description: string
  type:
    "tanker" | "truck" | "cooling-tank" | "mixing-tank" | "bag" | "evaporator"
}

export type LabTestDetails = {
  deliveryReportNumber: string
  client: string
  testingLab: string
  sellByDate: string
  samplingDate: string
  testingDate: string
  reportIssueDate: string
  testingTime: string
}

export type LabTestResult = {
  id: string
  parameter: string
  specification: string
  testMethod: string
  fSilo: string
  mSilo: string
  bSilo: string
  lSilo: string
  status: "" | "fail" | "pass"
}

export type ReportReviewStatus = "awaiting-review" | "approved" | "rejected"

export type ReportSignature = { name: string; email: string; signedAt: string }
export type ReportConclusion = "conforms" | "does-not-conform"
export type ReportReview = {
  status: ReportReviewStatus
  conclusion: ReportConclusion | ""
  remarks: string
  analysedBy: ReportSignature | null
}
export type ReportReviewAction = "approved" | "rejected"

export type TankerLogDetails = {
  serialNumber: string
  date: string
  sampleTime: string
  releaseTime: string
  vehicleNumber: string
  milkCentre: string
  deliveryNote: string
  releaseSlip: string
}

export type TankerChamberLog = {
  id: string
  chamber: string
  quantity: string
  temperature: string
  alcoholTest: string
  butterfat: string
  density: string
  snf: string
  ph: string
  lacticAcid: string
  rt: string
  addedWater: string
  freezingPoint: string
  adulterants: string
  extraneousMatter: string
  organoleptic: string
  antibiotics: string
  somaticCellCount: string
}

export type SiloLogDetails = {
  serialNumber: string
  date: string
  time: string
  sourceTank: string
  product: string
  quantity: string
  temperature: string
  rt: string
  acidity: string
  ph: string
  alcoholTest: string
  cob: string
  butterfat: string
  density: string
  snf: string
  addedWater: string
  freezingPoint: string
  urea: string
  neutralizers: string
  hydrogenPeroxide: string
  organoleptic: string
  processedToSilo: string
  labTechnician: string
  remarks: string
}

export type SampleLogSection<Key extends string> = {
  id: string
  title: string
  description: string
  fields: {
    key: Key
    label: string
    type?: "date" | "time" | "number" | "textarea"
    options?: string[]
    startsNewRow?: boolean
  }[]
}

export type StandardizationLogDetails = {
  serialNumber: string
  date: string
  time: string
  source: string
  quantity: string
  temperature: string
  resazurin1Hour: string
  resazurin2Hours: string
  resazurin3Hours: string
  phosphatase: string
  acidity: string
  ph: string
  alcoholTest: string
  hydrogenPeroxide: string
  butterfat: string
  density: string
  snf: string
  addedWater: string
  freezingPoint: string
  organoleptic: string
  mb: string
  labTechnician: string
  remarks: string
}

export type FinalProductType = "uht" | "flavored-milk" | "ghee"

export type FinalProductLogValues = {
  serialNumber: string
  analysisDate: string
  product: string
  machineNumber: string
  batchNumber: string
  manufactureDate: string
  expiryDate: string
  shift: string
  siloTime: string
  source: string
  temperature: string
  rt1: string
  rt2: string
  rt3: string
  siloFat: string
  siloDensity: string
  siloSnf: string
  brix: string
  siloPh: string
  siloLacticAcid: string
  alcoholTest: string
  finishedTime: string
  finishedFat: string
  finishedDensity: string
  heatIndex: string
  finishedPh: string
  finishedLacticAcid: string
  peroxideResidue: string
  peroxidase: string
  organoleptic: string
  averageWeight: string
  finishedRemarks: string
  labTechnician: string
  remarks: string
}

export type FinalProductDemoValues = {
  flavor: string
  moisture: string
  color: string
  aroma: string
  texture: string
  packaging: string
}

export type FinalProductLogDetails = FinalProductLogValues &
  Partial<FinalProductDemoValues> & {
    productType?: FinalProductType
    productDrafts?: Partial<
      Record<
        FinalProductType,
        FinalProductLogValues & Partial<FinalProductDemoValues>
      >
    >
  }

export type SampleStage =
  | "register"
  | "lab-tests"
  | "lab-report"
  | "tanker"
  | "silo"
  | "standardization"
  | "product-logs"
export type SampleStatus =
  "draft" | "registered" | "in-progress" | "awaiting-review" | "done"
export type Sample = SampleIdentity & {
  statusHistory: { status: SampleStatus; changedAt: string }[]
  archivedAt: string | null
  stage: SampleStage
  status: SampleStatus
  registration: SampleRegistration
  laboratory: {
    reportNumber: string
    details: LabTestDetails
    results: LabTestResult[]
    review: ReportReview
  }
  logs: {
    tanker: { details: TankerLogDetails; chambers: TankerChamberLog[] } | null
    silo: SiloLogDetails | null
    standardization: StandardizationLogDetails | null
    finalProduct: FinalProductLogDetails | null
  }
}
