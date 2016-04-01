
export function polynomial(input : number, slope : number, exp : number, vShift : number, hShift : number) : number {
    return slope * ((input - hShift) ^ exp) + vShift;
}

export function inversePolynomial(input : number, slope : number, exp : number, vShift : number, hShift : number) : number {
    var output = polynomial(input, slope, exp, vShift, hShift);
    return polynomial(output, slope, exp, vShift, hShift);
}

export function buildPolynomial(slope : number, exp : number, vShift : number, hShift : number) : string {
    return `${slope} * ((x - ${hShift}) ^ ${exp}) + ${vShift}`;
}

export function buildInversePolynomial(slope : number, exp : number, vShift : number, hShift : number) : string {
    return `${slope} * ((y - ${hShift}) ^ ${exp}) + ${vShift}`;
}