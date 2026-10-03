import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const baseUrl = 'https://download.geonames.org/export/dump/'
const files = ['countryInfo.txt', 'timeZones.txt']
const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'data-sources')

const downloads = await Promise.all(files.map(async file => {
    const response = await fetch(baseUrl + file)
    if (!response.ok) throw new Error(`Failed to download ${file}: HTTP ${response.status}`)
    const content = await response.text()
    if (content.length < 1000) throw new Error(`Downloaded ${file} looks empty or truncated`)
    return { file, content }
}))

await mkdir(target, { recursive: true })

for (const { file, content } of downloads) {
    await writeFile(join(target, file), content)
    console.log(`Saved data-sources/${file} (${content.length} bytes)`)
}
