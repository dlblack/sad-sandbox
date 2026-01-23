import React from "react";
import WizardRunner from "../_shared/WizardRunner";
import { makeWizardGeneralInfoStep } from "../_shared/steps";
import { makeSkewStep, skewChoiceToOptions } from "../_shared/steps";
import { makeTimeWindowStep, makeFlowRangesStep, makeProbabilitiesStep, makeSummaryStep } from "./steps";
import { getComponentLabel } from "../../../registry/componentRegistry";

type Bag = Record<string, unknown>;
interface WizardCtx {
  id?: string;
  type?: string;
  name?: string;
  description?: string;
  selectedDataset?: string;
  bag: Bag;
  analyses?: Record<string, unknown>;
}

export interface Bulletin17AnalysisWizardProps {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
  analyses?: Record<string, unknown>;
  onFinish?: (result: unknown) => void;
  onRemove?: () => void;
}

function asStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x ?? ""));
  return [];
}

function normName(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

function getBucketAnalyses(ctx: any): any[] {
  const bucketKey = getComponentLabel(String(ctx?.type ?? "")) || "";
  const list = (ctx?.analyses as any)?.[bucketKey];
  return Array.isArray(list) ? list : [];
}

function isSameId(a: any, ctxId?: string): boolean {
  if (!ctxId) return false;
  return a?.id === ctxId || a?.key === ctxId || a?.uuid === ctxId;
}

export default function Bulletin17AnalysisWizard(props: Bulletin17AnalysisWizardProps) {
  const steps = [
    makeWizardGeneralInfoStep(),
    makeTimeWindowStep(),
    makeFlowRangesStep(),
    makeSkewStep({ allowStation: false, allowWeighted: false, compact: true }),
    makeProbabilitiesStep(),
    makeSummaryStep(),
  ];

  const validateNext = (ctx: any, stepIndex: number) => {
    if (stepIndex === 0) {
      const name = normName(ctx?.name);
      if (!name) return false;

      const list = getBucketAnalyses(ctx);
      const taken = list.some((a: any) => {
        if (!a) return false;
        if (isSameId(a, ctx?.id)) return false;
        return normName(a?.name) === name;
      });

      return !taken;
    }

    if (stepIndex === 1) {
      const startYear = ctx.bag.startYear as number | undefined;
      const endYear = ctx.bag.endYear as number | undefined;
      if (!startYear || !endYear) return false;
      return startYear < endYear;
    }

    if (stepIndex === 3 && String(ctx.bag.skewChoice || "") === "option3") {
      return String(ctx.bag.regionalSkew ?? "") !== "" && String(ctx.bag.regionalSkewMSE ?? "") !== "";
    }

    return true;
  };

  interface B17Result {
    name?: string;
    description?: string;
    selectedDataset: string;

    startYear: number;
    endYear: number;
    flowRanges?: unknown;

    probability: number;
    probabilities: number[];

    datasetRef: string;
    options: unknown;
  }

  const buildResult = (ctx: WizardCtx): B17Result => {
    const opts = skewChoiceToOptions(
      String(ctx.bag.skewChoice || ""),
      ctx.bag.regionalSkew,
      ctx.bag.regionalSkewMSE
    );

    const probabilities = asStringArray(ctx.bag.probabilities)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));

    const probability = probabilities.length ? probabilities[0] / 100 : Number(ctx.bag.probability ?? 0.01);

    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: ctx.selectedDataset || "",
      startYear: Number(ctx.bag.startYear),
      endYear: Number(ctx.bag.endYear),
      flowRanges: ctx.bag.flowRanges,

      probability,
      probabilities,

      datasetRef: ctx.selectedDataset || "",
      options: opts,
    };
  };

  return (
    <WizardRunner
      {...props}
      steps={steps}
      validateNext={validateNext}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
      datasetFilter={(d: any) => String(d?.seriesKind ?? "") === "AnnualPeak"}
    />
  );
}
