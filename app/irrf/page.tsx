"use client";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { MoveLeft, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../_lib/storage-manager";
import Link from "next/link";
import { DefaultIRRFTable } from "../_lib/rpa-calculator";
import { Separator } from "@/components/ui/separator";


export default function IrrfPage() {
  const [deductionValue, setDeductionValue] = useState("");

  useEffect(() => {
    setDeductionValue(
      getLocalStorageItem<string>("irrf-deduction-value", "607.20")
    );
  }, []);

  return (
    <main className="flex flex-col xl:mx-auto xl:pt-10 items-center xl:w-2xl min-h-screen animate-in fade-in duration-1000">
      <div className="border rounded-lg p-6 w-full">
        <div className="w-full mb-10 flex justify-start">
          <Link href="/">
            <Button size="icon" variant="secondary" className="cursor-pointer">
              <MoveLeft />
            </Button>
          </Link>
        </div>
        <div className="w-full flex flex-col gap-1">
          <h4 className="text-xl font-semibold">Redução de Base</h4>
          <Separator className="mb-4" />
          <div className="flex flex-col gap-2">
            <Label htmlFor="deduction-amount" className="text-md">
              Redução de Base (R$)
            </Label>
            <InputGroup className="md:w-xs">
              <InputGroupAddon>R$</InputGroupAddon>
              <InputGroupInput
                id="deduction-amount"
                placeholder="0,00"
                inputMode="numeric"
                type="number"
                step={0.01}
                value={deductionValue}
                onChange={(e) => {
                  setDeductionValue(e.target.value);
                  setLocalStorageItem<string>(
                    "irrf-deduction-value",
                    Number(e.target.value).toFixed(2)
                  );
                }}
                onBlur={(e) =>
                  setDeductionValue(Number(e.target.value).toFixed(2))
                }
              />
              {deductionValue !== "607.20" && (
                <InputGroupButton
                  variant="ghost"
                  className="mr-1 cursor-pointer"
                  onClick={() => {
                    setDeductionValue("607.20");
                    setLocalStorageItem<string>(
                      "irrf-deduction-value",
                      "607.20"
                    );
                  }}
                >
                  <Undo2 />
                </InputGroupButton>
              )}
            </InputGroup>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mt-5 text-xl ">
              Redução do Imposto
            </h4>
            <Separator />
            <div className="flex flex-col gap-4">
              <p className="text-md">
                Para valores até R$ 5.000,00, o valor do imposto será zerado.
              </p>
              <p className="text-md">
                Para valores entre R$ 5.000,01 e R$ 7.350,00, o valor do imposto
                será reduzido em R$ 978,62 menos 0,133145 multiplicado pelo
                valor bruto.
              </p>
            </div>
            <h4 className="font-semibold mt-5 text-xl">Faixas do IRRF</h4>
            <Separator />
            {DefaultIRRFTable.records.map((bracket: any, index: number) => (
              <div key={index} className="mt-4 border p-4 rounded-lg">
                <span className="font-semibold text-xl">Faixa {index + 1}</span>
                <table className="w-full mt-2 text-sm table-auto border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2">Mínimo (R$)</th>
                      <th className="pb-2">Máximo (R$)</th>
                      <th className="pb-2">Alíquota (%)</th>
                      <th className="pb-2">Dedução (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{bracket.min.toFixed(2).replace(".", ",")}</td>
                      <td>{bracket.max === Infinity ? "-" : bracket.max.toFixed(2).replace(".", ",")}</td>
                      <td>{bracket.rate.toFixed(2).replace(".", ",")}</td>
                      <td>{bracket.deduction.toFixed(2).replace(".", ",")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
