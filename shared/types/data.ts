// Auto-imported on both server and client (Nuxt v3.14+ shared/ convention).
// NO imports of Vue, h3, or Nitro code in this file.

export interface PrivacyScore {
  informationCollected: number
  useOfInformation: number
  dataSharing: number
  securityMeasures: number
  userRights: number
  retentionPeriod: number
  complianceWithLaws: number
  updatesToPolicy: number
  clarityAndTransparency: number
  contactInformation: number
}

export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Rarely'

export interface Vendor {
  vendorId: string
  name: string
  category: string
  privacyScore: PrivacyScore
  frequency: Frequency
  lastSeen: string
  userCount: number
  studentCount: number
}

export type DpaStatus = 'Signed' | 'Unsigned' | 'Expired' | 'Pending'
export type RiskLabel = 'High Usage / No DPA' | 'No DPA' | 'High Risk Score'

export interface DpaRecord {
  vendorId: string
  status: DpaStatus
  signedDate: string | null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}

export type EdtechCertStatus = 'Certified' | 'Not Certified' | 'In Review' | 'Expired'

export interface EdtechRecord {
  vendorId: string
  certificationStatus: EdtechCertStatus
  certificationStandard: string | null
  certifiedDate: string | null
}
