export class ResponseCurve {

    public  type : string;
    public  slope : number;
    public  exp : number;
    public  vShift : number;
    public  hShift : number;
    public  threshold : number;
    
    constructor(compressedCurve : string) {
        var elements = compressedCurve.split(",");
        this.type = elements[0];
        this.slope = parseFloat(elements[1]);
        this.exp = parseFloat(elements[2]);
        this.vShift = parseFloat(elements[3]);
        this.hShift = parseFloat(elements[4]);
        this.threshold = parseFloat(elements[5]);
    }
}