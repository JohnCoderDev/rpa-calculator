export interface IRRFRecord {
  min: number;
  max: number;
  rate: number;
  deduction: number;
}

export interface IRRFTable {
  records: IRRFRecord[];
}

export interface IRRFResultRecord {
  base: number;
  deduction: number;
}

export interface IRRFResultTable {
  totalDeduction: number;
  records: IRRFResultRecord[];
  reducedBase: number;
  baseReduction: number;
}

export interface RpaCalculatorProps {
  grossAmount: number;
  issAliquot: number;
  inssAliquot: number;
  irrfDeduction: number;
  irrfTable: IRRFTable;
}

export interface RpaCalculatorResult {
  grossAmount: number;
  issValue: number;
  inssValue: number;
  irrfValue: number;
  totalDeductions: number;
  netAmount: number;
}

export const DefaultIRRFTable: IRRFTable = {
  records: [
    { min: 0.0, max: 2428.8, rate: 0.0, deduction: 0.0 },
    { min: 2428.81, max: 2826.65, rate: 7.5, deduction: 182.16 },
    { min: 2826.66, max: 3751.05, rate: 15.0, deduction: 394.16 },
    { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 675.49 },
    { min: 4664.69, max: Infinity, rate: 27.5, deduction: 908.73 },
  ],
};

export const DefaultRpaCalculatorProps: RpaCalculatorProps = {
  grossAmount: 0,
  issAliquot: 5.0,
  inssAliquot: 11.0,
  irrfDeduction: 607.2,
  irrfTable: DefaultIRRFTable,
};

export function calculateRpaByGrossValue(
  props: RpaCalculatorProps
): RpaCalculatorResult {
  const issValue = parseFloat(
    ((props.grossAmount * props.issAliquot) / 100).toFixed(2)
  );
  const inssValue = parseFloat(
    ((props.grossAmount * props.inssAliquot) / 100).toFixed(2)
  );
  const irrfValue = calculateIRRF(
    props.grossAmount,
    props.irrfDeduction,
    props.irrfTable
  );
  const totalDeductions = parseFloat(
    (issValue + inssValue + irrfValue).toFixed(2)
  );
  const netAmount = parseFloat(
    (props.grossAmount - totalDeductions).toFixed(2)
  );
  return {
    grossAmount: props.grossAmount,
    issValue,
    inssValue,
    irrfValue,
    totalDeductions,
    netAmount,
  };
}

export function calculateRpaByNetValue(
  desiredNetAmount: number,
  props: RpaCalculatorProps,
  tolerance: number = 0.01
): RpaCalculatorResult {
  let lowerBound = desiredNetAmount;
  let upperBound =
    Math.max(desiredNetAmount, props.irrfTable.records.slice(-2)[0].max) * 5;
  let estimatedGross = (lowerBound + upperBound) / 2;
  let result: RpaCalculatorResult = {
    grossAmount: 0,
    issValue: 0,
    inssValue: 0,
    irrfValue: 0,
    totalDeductions: 0,
    netAmount: 0,
  };

  while (
    lowerBound <= upperBound &&
    upperBound - lowerBound > tolerance &&
    Math.abs(result.netAmount - desiredNetAmount) > tolerance
  ) {
    result = calculateRpaByGrossValue({
      ...props,
      grossAmount: estimatedGross,
    });
    if (result.netAmount < desiredNetAmount) {
      lowerBound = estimatedGross;
    } else {
      upperBound = estimatedGross;
    }
    estimatedGross = (lowerBound + upperBound) / 2;
  }

  return result;
}

export function calculateIRRF(
  baseAmount: number,
  deduction: number,
  irrfTable: IRRFTable
): number {
  const reducedBase = baseAmount - deduction;
  const applicableBracket = irrfTable.records.find((bracket) => {
    return reducedBase >= bracket.min && reducedBase <= bracket.max;
  });
  let irrfValue = 0;
  irrfValue =
    (reducedBase * applicableBracket!.rate) / 100 -
    applicableBracket!.deduction;

  if (baseAmount <= 5000) {
    return 0;
  } else if (baseAmount <= 7350) {
    irrfValue = Math.max(irrfValue - (978.62 - 0.133145 * baseAmount), 0);
  }
  return parseFloat(irrfValue.toFixed(2));
}
