"use client";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { RpaCalculatorResult } from "../_lib/rpa-calculator";
import { Separator } from "@/components/ui/separator";

export default function ResultsPage() {
  const results: RpaCalculatorResult | null =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("rpa-calculation-result") || "null")
      : null;
  return (
    <main className="flex flex-col mx-auto xl:pt-10 items-center xl:w-xl min-h-screen animate-in fade-in duration-1000">
      <div className="xl:border rounded-lg p-6 w-full">
        <div className="w-full mb-10 flex justify-start">
          <Link href="/">
            <Button size="icon" variant="secondary" className="cursor-pointer">
              <MoveLeft />
            </Button>
          </Link>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h1 className="text-xl font-bold mb-2">Resultados do Cálculo</h1>
          <Separator className="mb-4" />
          <div className="flex justify-between pe-2 text-md">
            <div className="font-semibold">Valor Bruto</div>

            {results?.inssValue ?? 0 > 0 ? (
              <div className="font-mono">
                R$ {results?.grossAmount.toFixed(2).replace(".", ",")}
              </div>
            ) : (
              <div className="font-mono">&minus;</div>
            )}
          </div>
          <div className="flex justify-between pe-2 text-md">
            <div className="font-semibold">Valor do INSS</div>
            {results?.inssValue ?? 0 > 0 ? (
              <div className="text-red-400 font-mono">
                &minus; R$ {results?.inssValue.toFixed(2).replace(".", ",")}
              </div>
            ) : (
              <div className="font-mono">&minus;</div>
            )}
          </div>
          <div className="flex justify-between pe-2 text-md">
            <div className="font-semibold">Valor do ISS</div>
            {results?.inssValue ?? 0 > 0 ? (
              <div className="text-red-400 font-mono">
                &minus; R$ {results?.issValue.toFixed(2).replace(".", ",")}
              </div>
            ) : (
              <div className="font-mono">&minus;</div>
            )}
          </div>
          <div className="flex justify-between pe-2 text-md">
            <div className="font-semibold">Valor do IRRF</div>
            {results?.irrfValue ?? 0 > 0 ? (
              <div className="text-red-400 font-mono">
                &minus; R$ {results?.irrfValue.toFixed(2).replace(".", ",")}
              </div>
            ) : (
              <div className="font-mono">&minus;</div>
            )}
          </div>
          <div className="flex justify-between pe-2 text-md">
            <div className="font-semibold">Total de Descontos</div>
            {results?.totalDeductions ?? 0 > 0 ? (
              <div className="text-red-400 font-mono">
                &minus; R${" "}
                {results?.totalDeductions.toFixed(2).replace(".", ",")}
              </div>
            ) : (
              <div className="font-mono">&minus;</div>
            )}
          </div>
          <div className="flex justify-between pe-2 text-md mt-2">
            <div className="font-semibold text-blue-700">Valor Líquido</div>
            {results?.netAmount ?? 0 > 0 ? (
              <div className="text-blue-700 font-mono">
                R$ {results?.netAmount.toFixed(2).replace(".", ",")}
              </div>
            ) : (
              <div className="font-mono">&minus;</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
