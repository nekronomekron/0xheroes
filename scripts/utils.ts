export const toPaddedHex = (c:number, pad:number = 2) => {
	return c.toString(16).padStart(pad, '0');
};

export const rgbToHex = (r:number, g:number, b:number, a:number) => {
	if(a == 0) r = 0;
	return `${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}${toPaddedHex(a)}`;
};