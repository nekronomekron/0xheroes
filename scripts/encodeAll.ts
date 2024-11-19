import { PNGCollectionEncoder } from './pngCollectionEncoder'
import { promises as fs } from 'fs'
import path from 'path'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DESTINATION_HERO_ART = path.join(
    __dirname,
    '../assets/image-data-hero-art.json'
)

async function encodeFolder(
    encoder: PNGCollectionEncoder,
    folders: Array<string>
) {
    for (const folder of folders) {
        const folderpath = path.join(__dirname, '../assets', folder)
        const files = await fs.readdir(folderpath)
        for (const file of files) {
            const filePath = path.join(folderpath, file)
            await encoder.encodeImage(
                file.replace(/\.png$/, ''),
                folder,
                filePath
            )
        }
    }
}

const encodeHeroArt = async () => {
    const folders = ['body', 'skin', 'feet', 'hair', 'floors']

    const encoder = new PNGCollectionEncoder()
    await encodeFolder(encoder, folders)

    await encoder.writeToFile(DESTINATION_HERO_ART)
}

encodeHeroArt()
