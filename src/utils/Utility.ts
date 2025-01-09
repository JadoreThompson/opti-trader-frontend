export default class Utility {
    public static convertNumber(value: Number): void {
    }

    public static async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}