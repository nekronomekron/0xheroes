import { PNG, PNGWithMetadata } from 'pngjs';

import * as fs from 'fs';

import { rgbToHex, toPaddedHex } from './utils';

export interface ImageBounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class RLEImage {
    private _png:PNGWithMetadata;

    private _bounds: ImageBounds = { top: 0, bottom: 0, left: 0, right: 0 };

    constructor(filepath:string) {
        const data = fs.readFileSync(filepath);
	    this._png = PNG.sync.read(data);
    }

    get height(): number {
        return this._png.height;
    }

    get width(): number {
        return this._png.width;
    }

    get bounds(): ImageBounds {
        return this._bounds;
    }

    private async createIndex(colors: Map<string, number>):Promise<number[]> {
        const indexes:number[] = [];
    
        for (let y = this._bounds.top; y <= this._bounds.bottom; y++) {
            for (let x = this._bounds.left; x < this._bounds.right; x++) {
                let idx = (this._png.width * y + x) << 2;

                const r = this._png.data[idx];
                const g = this._png.data[idx + 1];
                const b = this._png.data[idx + 2];
                const a = this._png.data[idx + 3];

                const hexColor = rgbToHex(r, g, b, a);
                if (!colors.has(hexColor)) {
                    colors.set(hexColor, colors.size);
                }
    
                indexes.push(a === 0 ? 0 : colors.get(hexColor)!);
            }
        }
    
        return indexes;
    }

    public async toRLE(colors: Map<string, number>):Promise<string> {
        this._bounds = this.calcBounds();
        
        const index:number[] = await this.createIndex(colors);
        
        const encoding:string[] = [];
        let previous = index[0];
        let count = 1;
    
        for (let i = 1; i < index.length; i++) {
            if (index[i] !== previous || count === 255) {
                encoding.push(toPaddedHex(count), toPaddedHex(previous));
                count = 1;
                previous = index[i];
            } else {
                  count++;
            }
        }
      
        if (previous !== undefined) {
            encoding.push(toPaddedHex(count), toPaddedHex(previous));
        }
    
        const metadata = [
            0,
            this.bounds.top,
            this.bounds.right,
            this.bounds.bottom,
            this.bounds.left,
        ].map(v => toPaddedHex(v));

        return `0x${metadata.join('')}${encoding.join('')}`;
    }

    calcBounds(): ImageBounds {
        let bottom = this.height - 1;
        while (bottom > 0 && this._isTransparentRow(bottom)) {
            bottom--;
        }

        let top = 0;
        while (top < bottom && this._isTransparentRow(top)) {
            top++;
        }

        let right = this.width - 1;
        while (right >= 0 && this._isTransparentColumn(right)) {
            right--;
        }

        let left = 0;
        while (left < right && this._isTransparentColumn(left)) {
            left++;
        }

        return {
            top: top,
            bottom: bottom,
            left: left,
            right: right + 1,
        };
    }

    private _isTransparentColumn(column: number) {
        for (let row = 0; row < this.height; row++) {
            let idx = (this._png.width * row + column) << 2;
            if(this._png.data[idx + 3] !== 0) {
                return false;
            }
        }
        return true;
    }

    private _isTransparentRow(row: number) {
        for (let column = 0; column < this.width; column++) {
            let idx = (this._png.width * row + column) << 2;
            if(this._png.data[idx + 3] !== 0) {
                return false;
            }
        }
        return true;
    }
}