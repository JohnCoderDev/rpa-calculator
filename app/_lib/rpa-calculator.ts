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
  useSimplifiedTaxation: boolean;
  simplifiedTaxationDeductionRate: number;
  dependentsCount: number;
  dependentDeductionValue: number;
  irrfTable: IRRFTable;
}

export interface RpaCalculatorResult {
  grossAmount: number;
  issValue: number;
  inssValue: number;
  irrfResultTable: IRRFResultTable;
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
  useSimplifiedTaxation: true,
  simplifiedTaxationDeductionRate: 607.2,
  dependentsCount: 0,
  dependentDeductionValue: 189.59,
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
  const irrfResultTable = calculateIRRF(
    props.grossAmount,
    props.irrfTable,
    props.useSimplifiedTaxation,
    props.simplifiedTaxationDeductionRate,
    props.dependentsCount,
    props.dependentDeductionValue
  );
  const totalDeductions = parseFloat(
    (issValue + inssValue + irrfResultTable.totalDeduction).toFixed(2)
  );
  const netAmount = parseFloat(
    (props.grossAmount - totalDeductions).toFixed(2)
  );
  return {
    grossAmount: props.grossAmount,
    issValue,
    inssValue,
    irrfResultTable,
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
    irrfResultTable: {
      records: [],
      totalDeduction: 0,
      reducedBase: 0,
      baseReduction: 0,
    },
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
  irrfTable: IRRFTable,
  useSimplifiedTaxation: boolean,
  simplifiedTaxationDeductionRate: number,
  dependentsCount: number,
  dependentDeductionValue: number
): IRRFResultTable {
  let resultTable: IRRFResultTable = {
    records: [],
    totalDeduction: 0,
    reducedBase: 0,
    baseReduction: 0,
  };
  for (let record of irrfTable.records) {
    const reduction = useSimplifiedTaxation
      ? simplifiedTaxationDeductionRate
      : record.deduction + dependentsCount * dependentDeductionValue;
    const reducedBase = baseAmount - reduction;

    if (reducedBase >= record.min && reducedBase <= record.max) {
      resultTable.reducedBase = reducedBase;
      resultTable.baseReduction = reduction;
      resultTable.totalDeduction +=
        (reducedBase - record.min) * (record.rate / 100);
      resultTable.records.push({
        base: parseFloat((reducedBase - record.min).toFixed(2)),
        deduction: parseFloat(
          ((reducedBase - record.min) * (record.rate / 100)).toFixed(2)
        ),
      });
    } else if (reducedBase > record.max) {
      resultTable.totalDeduction +=
        (record.max - record.min) * (record.rate / 100);
      resultTable.records.push({
        base: parseFloat((record.max - record.min).toFixed(2)),
        deduction: parseFloat(
          ((record.max - record.min) * (record.rate / 100)).toFixed(2)
        ),
      });
    }
  }

  resultTable.totalDeduction = parseFloat(
    resultTable.totalDeduction.toFixed(2)
  );
  resultTable.reducedBase = parseFloat(resultTable.reducedBase.toFixed(2));
  resultTable.baseReduction = parseFloat(resultTable.baseReduction.toFixed(2));

  return resultTable;
}
