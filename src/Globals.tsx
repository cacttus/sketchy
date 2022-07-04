

export class Globals {
  public static IsDebug(): boolean {
    return true;
  }
  public static hash32(str: string): number {
    let hash = 0, i, chr;
    if (str.length === 0) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  public static assert(expr:boolean){
    if(!expr){
      console.log("Assertion Failed: TODO: line/file")
    }
  }
  public static isNotNull(val:any){
    return !Globals.isNull(val);
  }
  public static isNull(val:any){
    return val === null || val === undefined;
  }
}