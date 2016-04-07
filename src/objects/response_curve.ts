export class ResponseCurve {

    public type : string;
    public slope : number;
    public exp : number;
    public vShift : number;
    public hShift : number;
    public threshold : number;
    private compressedString : string;

    public static Polynomial = 'Polynomial';
    public static InversePolynomial = 'InversePolynomial';
    public static Logarithmic = 'Logarithmic';
    public static Logit = 'Logit';

    constructor(compressedCurve : string) {
        var elements = compressedCurve.split(",");
        this.type = elements[0];
        if(this.type.indexOf('[') === 0) {
            this.type = this.type.substr(1);
        }
        this.slope = parseFloat(elements[1]);
        this.exp = parseFloat(elements[2]);
        this.vShift = parseFloat(elements[3]);
        this.hShift = parseFloat(elements[4]);
        this.threshold = parseFloat(elements[5]);
        this.compressedString = compressedCurve;
    }

    public get isValid() : boolean {
        return (
            (typeof this.slope === 'number') &&
            (typeof this.exp === 'number') &&
            (typeof this.vShift === 'number') &&
            (typeof this.hShift === 'number') &&
            (typeof this.threshold === 'number')
        )
    }

    public clone() : ResponseCurve {
        return new ResponseCurve(this.compressedString);
    }

    public score(input : number) : number {
        var output = 0;
        switch(this.type) {
            case ResponseCurve.Polynomial:
                return this.solvePolynomial(input);
                break;
            case ResponseCurve.InversePolynomial:
                return this.solveInversePolynomial(input);
                break;
        }
        return output;
    }

    private solvePolynomial(input : number) : number {
        input = clamp01(input);
        var output = clamp01(this.slope * Math.pow((input - this.hShift), this.exp) + this.hShift);
        return Math.max(output, this.threshold);
    }

    private solveInversePolynomial(input : number) : number {
        var output = this.solvePolynomial(input);
        return this.solvePolynomial(output);
    }
}

function clamp01(input : number) {
    if(input < 0) input = 0;
    if(input > 1) input = 1;
    return input;
}