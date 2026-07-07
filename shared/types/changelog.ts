export interface ReleaseGroup {
  label: string
  labelClass: string
  items: string[]
}

export interface Release {
  version: string
  date: string
  groups: ReleaseGroup[]
}
