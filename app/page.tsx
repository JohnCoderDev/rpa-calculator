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
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { HoverCard, HoverCardContent } from "@radix-ui/react-hover-card";
import Link from "next/link";
import { Calculator, HelpCircleIcon, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  calculateRpaByGrossValue,
  calculateRpaByNetValue,
  DefaultIRRFTable,
  DefaultRpaCalculatorProps,
  RpaCalculatorProps,
  RpaCalculatorResult,
} from "./_lib/rpa-calculator";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "./_lib/storage-manager";
import { get } from "http";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const rpaPropsFromStorage = getLocalStorageItem<RpaCalculatorProps>(
    "rpa-calculator-props",
    DefaultRpaCalculatorProps
  );
  const calculationModeFromStorage = getLocalStorageItem<string>(
    "calculation-mode",
    "gross"
  );

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
  const [loading, setLoading] = useState(false);
  const loadingTimeout = 1000;
  const router = useRouter();

  useEffect(() => {
    const props: RpaCalculatorProps = {
      grossAmount: parseFloat(amountValue),
      issAliquot: parseFloat(issAliquot),
      inssAliquot: parseFloat(inssAliquot),
      irrfDeduction: getLocalStorageItem<number>("irrf-deduction-value", 607.2),
      irrfTable: DefaultIRRFTable,
    };
    setLocalStorageItem<RpaCalculatorProps>("rpa-calculator-props", props);
    setLocalStorageItem<string>("calculation-mode", calculationMode);
  }, [calculationMode, amountValue, inssAliquot, issAliquot]);

  return (
    <main className="flex min-h-screen mx-auto flex-col items-center xl:pt-10 xl:w-xl animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 xl:border xl:border-gray-200 p-16 rounded-lg xl:shadow-sm">
        <h4 className="text-xl font-bold mb-6">
          Calculadora de Recibo de Pessoas Autônomas
        </h4>
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="calculation-mode" className="text-md">
              Modo de Cálculo
            </Label>
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
            <Label htmlFor="amount" className="text-md">
              Valor (R$)
            </Label>
            <InputGroup className="text-md">
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
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex flex-col gap-2 w-xs">
            <Label htmlFor="inss-aliquot" className="text-md">
              INSS (%)
            </Label>
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
            <Label htmlFor="iss-aliquot" className="text-md">
              ISS (%)
            </Label>
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
              <ItemTitle className="text-md">IRRF</ItemTitle>
              <ItemDescription>
                Imposto de renda retido na fonte calculado com base na tabela
                progressiva mensal.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Tooltip>
                <TooltipContent>Configurações do IRRF</TooltipContent>
                <TooltipTrigger asChild>
                  <Link href="/irrf">
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                    >
                      <Settings2 />
                    </Button>
                  </Link>
                </TooltipTrigger>
              </Tooltip>
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
                irrfDeduction: getLocalStorageItem<number>(
                  "irrf-deduction-value",
                  607.2
                ),
                irrfTable: DefaultIRRFTable,
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
