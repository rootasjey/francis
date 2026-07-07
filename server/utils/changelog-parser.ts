import type { Release, ReleaseGroup } from '~~/shared/types/changelog'

const groupStyles: Record<string, string> = {
  Features: 'text-emerald-500',
  Tests: 'text-amber-500',
  Documentation: 'text-sky-500',
  Chores: 'text-muted-foreground/50',
}

function getLabelClass(label: string): string {
  for (const [key, value] of Object.entries(groupStyles)) {
    if (label.includes(key)) return value
  }
  return 'text-muted-foreground/50'
}

export function parseChangelog(markdown: string): Release[] {
  const lines = markdown.split('\n')
  const releases: Release[] = []

  let currentRelease: Release | null = null
  let currentGroup: ReleaseGroup | null = null

  const versionRe = /^#{2,3}\s+(\[?\d+\.\d+\.\d+\]?)(?:\([^)]+\))?\s*\((\d{4}-\d{2}-\d{2})\)/
  const groupRe = /^###\s+(.+)/
  const itemRe = /^\*\s+(.+)/
  const commitRefRe = /\s*\(\[[a-f0-9]+\]\([^)]+\)\)$/

  for (const line of lines) {
    const versionMatch = line.match(versionRe)
    if (versionMatch) {
      if (currentRelease) {
        if (currentGroup) {
          currentRelease.groups.push(currentGroup)
          currentGroup = null
        }
        releases.push(currentRelease)
      }
      currentRelease = {
        version: versionMatch[1].replace(/[\[\]]/g, ''),
        date: versionMatch[2],
        groups: [],
      }
      continue
    }

    const groupMatch = line.match(groupRe)
    if (groupMatch && currentRelease) {
      if (currentGroup) {
        currentRelease.groups.push(currentGroup)
      }
      const label = groupMatch[1].trim()
      currentGroup = {
        label,
        labelClass: getLabelClass(label),
        items: [],
      }
      continue
    }

    const itemMatch = line.match(itemRe)
    if (itemMatch && currentGroup) {
      const item = itemMatch[1].trim().replace(commitRefRe, '')
      currentGroup.items.push(item)
    }
  }

  if (currentGroup && currentRelease) {
    currentRelease.groups.push(currentGroup)
  }
  if (currentRelease) {
    releases.push(currentRelease)
  }

  return releases
}
