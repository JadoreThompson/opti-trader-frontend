import { Orderbook } from "../componenets/DOM";

export default class UtilsManager {
  public static formatPrice(value: Number | String): string {
    let nparts = String(value).split("");
    let tag: string = "";

    if (nparts[0] === "-") {
      nparts = nparts.slice(1);
      tag = "-";
    }

    nparts.reverse();
    let allParts = [];
    for (let i = 0; i < nparts.length; i += 3) {
      allParts.push(nparts.slice(i, i + 3).reverse());
    }

    allParts.reverse();
    return tag + "$" + allParts.map((item) => item.join("")).join(",");
  }

  public static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static generateOrderbook(
    minPrice?: number,
    maxPrice?: number,
    quantity?: number
  ): Orderbook {
    const priceRange = { min: minPrice ?? 100, max: maxPrice ?? 200 };

    const bids: Record<number, number> = {};
    for (let i = 0; i < (quantity ?? 10); i++) {
      const price =
        Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) +
        priceRange.min;
      const qty = Math.floor(Math.random() * 50) + 1;
      bids[price] = qty;
    }

    const asks: Record<number, number> = {};
    for (let i = 0; i < (quantity ?? 10); i++) {
      const price =
        Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) +
        priceRange.min;
      const qty = Math.floor(Math.random() * 50) + 1;
      asks[price] = qty;
    }

    const sortedBids = Object.fromEntries(
      Object.entries(bids).sort((a, b) => +b[0] - +a[0])
    );

    const sortedAsks = Object.fromEntries(
      Object.entries(asks).sort((a, b) => +a[0] - +b[0])
    );

    console.log(Object.keys(sortedBids).length);
    console.log(Object.keys(sortedAsks).length);
    return {
      bids: sortedBids,
      asks: sortedAsks,
    };
  }
}
