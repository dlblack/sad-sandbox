import React, { useMemo, useEffect, useState } from "react";
import WizardLayoutSidebar from "./WizardLayoutSidebar";
import WizardNavigation from "../../common/WizardNavigation";
import { componentMetadata } from "../../../utils/componentMetadata";
import { Card } from "@mantine/core";

type DatasetItem = {
  name: string;
  description?: string;
};

export type WizardBag = Record<string, unknown>;

export type WizardCtx<B extends WizardBag = WizardBag> = {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  selectedDataset: string;
  setSelectedDataset: React.Dispatch<React.SetStateAction<string>>;
  datasetList: DatasetItem[];
  bag: B;
  setBag: React.Dispatch<React.SetStateAction<B>>;
  type?: string;
  id?: string;
  data: Record<string, unknown>;
};

export type WizardStep<B extends WizardBag = WizardBag> = {
  label: string;
  render: (ctx: WizardCtx<B>) => React.ReactNode;
  validate?: (ctx: WizardCtx<B>) => boolean;
};

export type WizardRunnerProps<B extends WizardBag = WizardBag, R = unknown> = {
  type?: string;
  id?: string;
  data?: Record<string, unknown>;
  analyses?: Record<string, { name?: string }[]>;
  defaultDatasetKey?: string;
  steps: WizardStep<B>[];
  buildResult: (ctx: WizardCtx<B>) => R;
  validateNext?: (ctx: WizardCtx<B>, stepNumber: number) => boolean;
  onFinish?: (type: string | undefined, result: R, id?: string) => void;
  onRemove?: (id?: string) => void;
};

export default function WizardRunner<B extends WizardBag = WizardBag, R = unknown>(
    props: WizardRunnerProps<B, R>
) {
  const {
    type,
    id,
    data = {},
    analyses = {},
    defaultDatasetKey = "Discharge",
    steps = [],
    buildResult,
    validateNext,
    onFinish,
    onRemove,
  } = props;

  const datasetList = (data?.[defaultDatasetKey] as DatasetItem[] | undefined) ?? [];
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [bag, setBag] = useState<B>({} as B);

  useEffect(() => {
    if (datasetList.length > 0 && !selectedDataset) {
      setSelectedDataset(datasetList[0].name);
    }
  }, [datasetList, selectedDataset]);

  useEffect(() => {
    if (datasetList.length > 0 && selectedDataset) {
      const found = datasetList.find((d) => d.name === selectedDataset);
      setDescription((prev) => (prev ? prev : found?.description || ""));
    }
  }, [selectedDataset, datasetList]);

  const displayType = (componentMetadata as any)?.[type as any]?.entityName ?? type;
  const existingNames = useMemo(() => {
    const arr = ((analyses && (analyses as any)[displayType as any]) || []) as { name?: string }[];
    return arr.map((a) => (a.name || "").trim().toLowerCase());
  }, [analyses, displayType]);

  const nameTrimmed = name.trim().toLowerCase();
  const isDuplicateName = nameTrimmed.length > 0 && existingNames.includes(nameTrimmed);

  const ctx: WizardCtx<B> = {
    step,
    setStep,
    name,
    setName,
    description,
    setDescription,
    selectedDataset,
    setSelectedDataset,
    datasetList,
    bag,
    setBag,
    type,
    id,
    data,
  };

  const currentIndex = step > 0 ? step - 1 : 0;
  const current = steps[currentIndex];
  const perStepInvalid = typeof current?.validate === "function" && !current.validate(ctx);

  const disableNext =
      (step === 1 && (isDuplicateName || !nameTrimmed)) ||
      perStepInvalid ||
      (typeof validateNext === "function" && !validateNext(ctx, step));

  function handleFinish(e?: React.FormEvent) {
    if (e && typeof (e as any).preventDefault === "function") {
      (e as any).preventDefault();
    }

    const result = buildResult(ctx);

    if (typeof onFinish === "function") {
      onFinish(type, result, id);
    } else {
      console.warn("WizardRunner: onFinish handler not provided");
    }

    if (typeof onRemove === "function") {
      onRemove(id);
    }
  }

  const sidebarSteps = steps.map((s) => ({ label: s.label }));
  const active0 = currentIndex;

  const handleStepClick = (i: number) => {
    if (i <= active0) setStep(i + 1);
  };

  const footer = (
      <WizardNavigation
          step={step}
          setStep={setStep}
          numSteps={steps.length}
          onFinish={handleFinish}
          disableNext={!!disableNext}
          onCancel={() => onRemove?.(id)}
          finishLabel={undefined}
      />
  );

  return (
      <Card withBorder radius="md" padding="sm">
        <WizardLayoutSidebar
            steps={sidebarSteps}
            active={active0}
            onStepClick={handleStepClick}
            footer={footer}
        >
          {current?.render(ctx)}
        </WizardLayoutSidebar>
      </Card>
  );
}
