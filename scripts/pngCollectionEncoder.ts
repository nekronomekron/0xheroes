import { promises as fs } from 'fs';
import { RLEImage } from './rleImage';

export interface ImageData {
	colors: string[];
	images: Record<string, EncodedImage[]>;
}

export interface EncodedImage {
	filename: string;
	data: string;
}

export class PNGCollectionEncoder {
	private readonly _transparent: [string, number] = ['', 0];

	private _images: Map<string, string> = new Map();
	private _folders: { [name: string]: string[] } = {};
	private _colors: Map<string, number> = new Map([this._transparent]);

	constructor() {
	}

	public get images(): EncodedImage[] {
		return this.format(true).root;
	}

	public get data(): ImageData {
		return { colors: [...this._colors.keys()], images: this.format() };
	}

	public async encodeImage(name: string, folder: string, filePath:string): Promise<string> {
		const image = new RLEImage(filePath);
		const rle:string = await image.toRLE(this._colors);
		
		this._images.set(name, rle);
		
		if (folder) {
			(this._folders[folder] ||= []).push(name);
		}

		console.log(`+ Encoded image [${filePath}]`);
		
		return rle;
	}

	public async writeToFile(outputFile = 'encoded-images.json'): Promise<void> {
		await fs.writeFile(outputFile, JSON.stringify(this.data, null, 2));
	}

	private format(flatten = false) {
		const images = new Map(this._images);
		const folders = Object.entries(this._folders);

		let data: Record<string, EncodedImage[]> = {};
		if (!flatten && folders.length) {
		data = folders.reduce<Record<string, EncodedImage[]>>((result, [folder, filenames]) => {
			result[folder] = [];

			filenames.forEach(filename => {
			result[folder].push({
				filename,
				data: images.get(filename) as string,
			});
			images.delete(filename);
			});

			return result;
		}, {});
		}

		if (images.size) {
		data.root = [...images.entries()].map(([filename, data]) => ({
			filename,
			data,
		}));
		}
		return data;
	}
}