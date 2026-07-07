import changelogContent from '#changelog-content'

export default defineEventHandler(() => {
  return parseChangelog(changelogContent)
})
