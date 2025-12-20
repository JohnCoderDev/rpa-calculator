"use client";

import { Button } from "@/components/ui/button";
import { HoverCardTrigger } from "@/components/ui/hover-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HoverCard, HoverCardContent } from "@radix-ui/react-hover-card";
import {
  Calculator,
  HelpCircleIcon,
  Plus,
  Settings2,
  Trash2,
  Undo2,
  UsersRound,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  calculateRpaByGrossValue,
  calculateRpaByNetValue,
  DefaultIRRFTable,
  DefaultRpaCalculatorProps,
  RpaCalculatorProps,
  RpaCalculatorResult,
} from "./_lib/rpa-calculator";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export default function Home() {
  const rpaPropsFromStorage =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("rpa-calculator-props") ??
            JSON.stringify(DefaultRpaCalculatorProps)
        )
      : DefaultRpaCalculatorProps;

  const calculationModeFromStorage =
    typeof window !== "undefined"
      ? localStorage.getItem("calculation-mode") || "gross"
      : "gross";

  const [inssAliquot, setInssAliquot] = useState(
    rpaPropsFromStorage.inssAliquot?.toFixed(2) ?? "0.00"
  );
  const [issAliquot, setIssAliquot] = useState(
    rpaPropsFromStorage.issAliquot?.toFixed(2) ?? "0.00"
  );
  const [calculationMode, setCalculationMode] = useState(
    calculationModeFromStorage
  );
  const [amountValue, setAmountValue] = useState(
    rpaPropsFromStorage.grossAmount?.toFixed(2) ?? "0.00"
  );
  const [simplifiedRegime, setSimplifiedRegime] = useState(
    rpaPropsFromStorage.useSimplifiedTaxation
  );
  const [simplifiedDeductionValue, setSimplifiedDeductionValue] = useState(
    rpaPropsFromStorage.simplifiedTaxationDeductionRate?.toFixed(2) ?? "0.00"
  );
  const [dependentsCount, setDependentsCount] = useState(
    rpaPropsFromStorage.dependentsCount?.toString() ?? "0"
  );
  const [dependentDeductionValue, setDependentDeductionValue] = useState(
    rpaPropsFromStorage.dependentDeductionValue?.toFixed(2) ?? "0.00"
  );
  const [irrfTable, setIrrfTable] = useState(DefaultIRRFTable);
  const [loading, setLoading] = useState(false);
  const loadingTimeout = 1000;
  const router = useRouter();

  useEffect(() => {
    const props: RpaCalculatorProps = {
      grossAmount: parseFloat(amountValue),
      issAliquot: parseFloat(issAliquot),
      inssAliquot: parseFloat(inssAliquot),
      irrfTable: irrfTable,
      dependentsCount: parseInt(dependentsCount),
      dependentDeductionValue: parseFloat(dependentDeductionValue),
      useSimplifiedTaxation: simplifiedRegime,
      simplifiedTaxationDeductionRate: parseFloat(simplifiedDeductionValue),
    };
    localStorage.setItem("rpa-calculator-props", JSON.stringify(props));
    localStorage.setItem("calculation-mode", calculationMode);
  }, [
    calculationMode,
    amountValue,
    inssAliquot,
    issAliquot,
    simplifiedRegime,
    simplifiedDeductionValue,
    dependentsCount,
    dependentDeductionValue,
    irrfTable,
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 w-max border border-gray-200 p-16 rounded-lg shadow-sm">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-2 w-xs">
            <Label htmlFor="calculation-mode">Modo de Cálculo</Label>
            <Select
              value={calculationMode}
              onValueChange={(e) => setCalculationMode(e)}
            >
              <SelectTrigger className="w-xs">
                <SelectValue placeholder="Selecione um modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Modos de Cálculo</SelectLabel>
                  <SelectItem value="gross">
                    Valor que eu quero cobrar
                  </SelectItem>
                  <SelectItem value="net">
                    Valor que eu quero receber
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-xs">
            <Label htmlFor="amount">Valor (R$)</Label>
            <InputGroup>
              <InputGroupAddon>R$</InputGroupAddon>
              <InputGroupInput
                id="amount"
                placeholder="0,00"
                inputMode="numeric"
                type="number"
                step={0.01}
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                onBlur={(e) =>
                  setAmountValue(parseFloat(e.target.value).toFixed(2))
                }
              />
            </InputGroup>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-2 w-xs">
            <Label htmlFor="inss-aliquot">INSS (%)</Label>
            <InputGroup>
              <InputGroupInput
                id="inss-aliquot"
                placeholder="0,00%"
                inputMode="numeric"
                type="number"
                step={0.01}
                value={inssAliquot}
                onChange={(e) => setInssAliquot(e.target.value)}
                onBlur={(e) =>
                  setInssAliquot(Number(e.target.value).toFixed(2))
                }
              />
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button variant="link" size="icon">
                    <HelpCircleIcon />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 inline-block z-50 shadow-lg p-4 rounded-md fade-out-80 bg-white border border-gray-200 animate-in fade-in-100">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">INSS</h4>
                    <p className="text-sm">
                      As aliquotas variam de 11% a 20% dependendo do valor do
                      RPA e do regime escolhido.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 cursor-pointer"
                    >
                      <a
                        href="https://pt.wikipedia.org/wiki/Instituto_Nacional_do_Seguro_Social"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Saiba mais sobre INSS
                      </a>
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </InputGroup>
          </div>
          <div className="flex flex-col gap-2 w-xs">
            <Label htmlFor="iss-aliquot">ISS (%)</Label>
            <InputGroup>
              <InputGroupInput
                id="iss-aliquot"
                placeholder="0,00%"
                inputMode="numeric"
                type="number"
                step={0.01}
                value={issAliquot}
                onChange={(e) => setIssAliquot(e.target.value)}
                onBlur={(e) => setIssAliquot(Number(e.target.value).toFixed(2))}
              />
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button variant="link" size="icon">
                    <HelpCircleIcon />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 inline-block z-50 shadow-lg p-4 rounded-md fade-out-80 bg-white border border-gray-200 animate-in fade-in-100">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">ISS</h4>
                    <p className="text-sm">
                      As aliquotas variam de 2% a 5% dependendo do município.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 cursor-pointer"
                    >
                      <a
                        href="https://www.totvs.com/blog/adequacao-a-legislacao/iss/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Saiba mais sobre ISS
                      </a>
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </InputGroup>
          </div>
        </div>
        <div>
          <Item variant="default" className="p-0">
            <ItemContent>
              <ItemTitle>IRRF</ItemTitle>
              <ItemDescription>
                Imposto de renda retido na fonte calculado com base na tabela
                progressiva mensal.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Settings2 />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className={`max-h-96 overflow-y-auto p-4 ${
                    simplifiedRegime ? "w-auto" : "w-2xl"
                  } `}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center">
                      <Label htmlFor="simplified-regime">
                        Regime Simplificado
                      </Label>
                      <Switch
                        id="simplified-regime"
                        checked={simplifiedRegime}
                        onClick={() => setSimplifiedRegime(!simplifiedRegime)}
                      />
                    </div>
                    {simplifiedRegime ? (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="deduction-amount">
                          Valor da Dedução (R$)
                        </Label>
                        <InputGroup>
                          <InputGroupAddon>R$</InputGroupAddon>
                          <InputGroupInput
                            id="deduction-amount"
                            placeholder="0,00"
                            inputMode="numeric"
                            type="number"
                            step={0.01}
                            value={simplifiedDeductionValue}
                            onChange={(e) =>
                              setSimplifiedDeductionValue(e.target.value)
                            }
                          />
                        </InputGroup>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-semibold">Dependentes</h4>
                        <Separator />
                        <div className="flex flex-row gap-2 ">
                          <div className="flex flex-col gap-2 w-[50%]">
                            <Label htmlFor="dependents-count">
                              Número de Dependentes
                            </Label>
                            <InputGroup>
                              <InputGroupAddon>
                                <UsersRound />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                step={1}
                                id="dependents-count"
                                value={dependentsCount}
                                onChange={(e) =>
                                  setDependentsCount(e.target.value)
                                }
                                onBlur={(e) =>
                                  setDependentsCount(
                                    Number(e.target.value || 0).toFixed(0)
                                  )
                                }
                              />
                            </InputGroup>
                          </div>
                          <div className="flex flex-col gap-2 w-[50%]">
                            <Label htmlFor="value-per-dependent">
                              Valor por Dependente (R$)
                            </Label>
                            <InputGroup>
                              <InputGroupAddon>R$</InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                step={0.01}
                                id="value-per-dependent"
                                value={dependentDeductionValue}
                                onChange={(e) =>
                                  setDependentDeductionValue(e.target.value)
                                }
                                onBlur={(e) =>
                                  setDependentDeductionValue(
                                    Number(e.target.value || 0).toFixed(2)
                                  )
                                }
                              />
                            </InputGroup>
                          </div>
                        </div>
                        <h4 className="font-semibold">Tabela de IRRF</h4>
                        <Separator />
                        <div className="flex flex-row items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              const records = [...irrfTable.records];
                              if (records.length > 0) {
                                records[records.length - 1].max =
                                  records[records.length - 1].min + 0.01;
                              }
                              const lastRecord =
                                records[records.length - 1] ?? null;

                              const newRecord = {
                                min: lastRecord?.max ?? 0,
                                max: Infinity,
                                rate: (lastRecord?.rate ?? 0) + 7.5,
                                deduction: 0,
                              };
                              const updated = [...records, newRecord];
                              setIrrfTable({ ...irrfTable, records: updated });
                              setTimeout(() => {
                                const newIndex = updated.length - 1;
                                const newInput = document.getElementById(
                                  `min-${newIndex}`
                                );
                                if (newInput) {
                                  newInput.focus();
                                  newInput.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }, 0);
                            }}
                          >
                            <Plus />
                            Adicionar Faixa
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              setIrrfTable(DefaultIRRFTable);
                            }}
                          >
                            <Undo2 />
                            Restaurar Padrão
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              setIrrfTable({ records: [] });
                            }}
                          >
                            <Trash2 />
                            Limpar Tabela
                          </Button>
                        </div>
                        {irrfTable.records.map((record, index) => (
                          <div
                            key={index}
                            className="flex flex-row gap-2 items-end"
                          >
                            <div className="flex flex-col gap-2">
                              <Label htmlFor={`min-${index}`}>Mínimo</Label>
                              <InputGroup>
                                <InputGroupAddon>R$</InputGroupAddon>
                                <InputGroupInput
                                  id={`min-${index}`}
                                  type="number"
                                  value={record.min}
                                  onChange={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    newRecords[index].min = parseFloat(
                                      e.target.value
                                    );
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                  onBlur={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    const value = round(
                                      parseFloat(e.target.value),
                                      2
                                    );
                                    newRecords[index].min = value;
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                />
                              </InputGroup>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor={`max-${index}`}>Máximo</Label>
                              <InputGroup>
                                <InputGroupAddon>R$</InputGroupAddon>
                                <InputGroupInput
                                  id={`max-${index}`}
                                  type="number"
                                  value={record.max}
                                  onChange={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    newRecords[index].max = parseFloat(
                                      e.target.value
                                    );
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                  onBlur={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    const value = round(
                                      parseFloat(e.target.value),
                                      2
                                    );
                                    newRecords[index].max = value;
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                />
                              </InputGroup>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor={`rate-${index}`}>
                                Alíquota (%)
                              </Label>
                              <InputGroup>
                                <InputGroupInput
                                  id={`rate-${index}`}
                                  type="number"
                                  value={record.rate}
                                  onChange={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    newRecords[index].rate = parseFloat(
                                      e.target.value
                                    );
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                  onBlur={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    const value = round(
                                      parseFloat(e.target.value),
                                      2
                                    );
                                    newRecords[index].rate = value;
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                />
                              </InputGroup>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor={`deduction-${index}`}>
                                Dedução
                              </Label>
                              <InputGroup>
                                <InputGroupAddon>R$</InputGroupAddon>
                                <InputGroupInput
                                  id={`deduction-${index}`}
                                  type="number"
                                  value={record.deduction}
                                  onChange={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    newRecords[index].deduction = parseFloat(
                                      e.target.value
                                    );
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                  onBlur={(e) => {
                                    const newRecords = [...irrfTable.records];
                                    const value = round(
                                      parseFloat(e.target.value),
                                      2
                                    );
                                    newRecords[index].deduction = value;
                                    setIrrfTable({
                                      ...irrfTable,
                                      records: newRecords,
                                    });
                                  }}
                                />
                              </InputGroup>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newRecords = irrfTable.records.filter(
                                  (_, i) => i !== index
                                );
                                setIrrfTable({
                                  ...irrfTable,
                                  records: newRecords,
                                });
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </ItemActions>
          </Item>
        </div>
        <Button
          disabled={loading}
          className="cursor-pointer w-full"
          onClick={() => {
            setLoading(true);

            setTimeout(() => {
              const props: RpaCalculatorProps = {
                grossAmount: parseFloat(amountValue),
                issAliquot: parseFloat(issAliquot),
                inssAliquot: parseFloat(inssAliquot),
                irrfTable: irrfTable,
                dependentsCount: parseInt(dependentsCount),
                dependentDeductionValue: parseFloat(dependentDeductionValue),
                useSimplifiedTaxation: simplifiedRegime,
                simplifiedTaxationDeductionRate: parseFloat(
                  simplifiedDeductionValue
                ),
              };

              const result: RpaCalculatorResult =
                calculationMode === "gross"
                  ? calculateRpaByGrossValue(props)
                  : calculateRpaByNetValue(parseFloat(amountValue), props);
              localStorage.setItem(
                "rpa-calculation-result",
                JSON.stringify(result)
              );
              router.push("/results");
              setLoading(false);
            }, loadingTimeout);
          }}
        >
          {loading ? <Spinner /> : <Calculator />}
          {loading ? "Calculando resultados..." : "Calcular"}
        </Button>
      </div>
    </main>
  );
}
