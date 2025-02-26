import { toast } from "react-toastify";
import { Orderbook } from "../../componenets/DOM";
import AlertIcon from "../../componenets/icons/Alert";
import DollarIcon from "../../componenets/icons/DollarIcon";

export default class UtilsManager {
  static toastOptions = {
    theme: "dark",
  };

  static toastSuccessOptions = {
    icon: <DollarIcon size="50px" fill="green" />,
    ...this.toastOptions,
  };

  static toastErrorOptions = {
    icon: <AlertIcon size="50px" fill="#b33f32" />,
    ...this.toastOptions,
  };

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

    const partsJoined = allParts.map((item) => item.join(""));
    let dollarAmount: String;

    if (partsJoined[partsJoined.length - 1][0] === ".") {
      dollarAmount = partsJoined.slice(0, partsJoined.length - 1).join(",");
      dollarAmount += partsJoined[partsJoined.length - 1];
    } else {
      dollarAmount = partsJoined.join(",");
    }

    return tag + "$" + dollarAmount;
  }

  public static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static generateOrderbook(
    minPrice?: number,
    maxPrice?: number,
    quantity?: number
  ): Orderbook {
    const priceRange = { min: minPrice ?? 100, max: maxPrice ?? 500 };

    const bids: Record<number, number> = {};
    for (let i = 0; i < (quantity ?? 10); i++) {
      let price: number;
      
      while (true) {
        price =
          Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) +
          priceRange.min;

        if (!(price in bids)) {
          break;
        }
      }

      const qty = Math.floor(Math.random() * 50) + 1;
      bids[price] = qty;
    }

    const asks: Record<number, number> = {};
    for (let i = 0; i < (quantity ?? 10); i++) {
      let price: number;

      while (true) {
        price =
          Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) +
          priceRange.min;

        if (!(price in asks)) {
          break;
        }
      }

      const qty = Math.floor(Math.random() * 50) + 1;
      asks[price] = qty;
    }

    const sortedBids = Object.fromEntries(
      Object.entries(bids).sort((a, b) => +b[0] - +a[0])
    );

    const sortedAsks = Object.fromEntries(
      Object.entries(asks).sort((a, b) => +a[0] - +b[0])
    );

    return {
      bids: sortedBids,
      asks: sortedAsks,
    };
  }

  public static generateOrders(amount: number = 10): Record<string, any>[] {
    const orders = [];

    for (let i = 0; i < amount; i++) {
      const isClosed = Math.random() > 0.5;
      const isLong = Math.random() > 0.5;

      const order = {
        amount: (Math.random() * 10).toFixed(2),
        entry_price: (Math.random() * 5000 + 1000).toFixed(2),
        upl: isClosed ? undefined : (Math.random() * 200 - 100).toFixed(2),
        pl: isClosed ? (Math.random() * 200 - 100).toFixed(2) : undefined,
        status: isClosed ? "closed" : "open",
        take_profit: isClosed
          ? undefined
          : (Math.random() * 6000 + 2000).toFixed(2),
        stop_loss: isClosed
          ? undefined
          : (Math.random() * 3000 + 1000).toFixed(2),
        side: isLong ? "long" : "short",
      };

      orders.push(order);
    }

    return orders;
  }

  public static toastError(message: string): void {
    toast.error(message, this.toastErrorOptions);
  }

  public static toastSuccess(message: string): void {
    toast.success(message, this.toastSuccessOptions);
  }
}
