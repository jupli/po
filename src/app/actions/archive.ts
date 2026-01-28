'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function archiveDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const date = formData.get('date') as string // YYYY-MM-DD
    const filename = formData.get('filename') as string

    if (!file || !date || !filename) {
      throw new Error('Missing required fields')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Directory path: public/archive/YYYY-MM-DD
    const dirPath = join(process.cwd(), 'public', 'archive', date)
    
    // Ensure directory exists
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }

    const filePath = join(dirPath, filename)
    
    await writeFile(filePath, buffer)
    
    return { success: true, path: `/archive/${date}/${filename}` }
  } catch (error) {
    console.error('Archiving error:', error)
    return { success: false, error: 'Failed to archive document' }
  }
}
