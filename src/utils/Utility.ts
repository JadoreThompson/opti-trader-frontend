export default class Utility {
    public static displayNumber(value: Number | String): string {
        let nparts = String(value).split('');
        let tag: string = '';
        
        if (nparts[0] === '-') {
            nparts = nparts.slice(1);
            tag = '-';
        } 
    
        nparts.reverse();
        let allParts = [];
        for (let i = 0; i < nparts.length; i += 3) {
            allParts.push(nparts.slice(i, i + 3).reverse());
        }
        allParts.reverse();
        return tag + '$' + allParts.map((item) => item.join('')).join(',');
    }

    public static async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}