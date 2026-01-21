import React, { useMemo, useEffect, useState } from "react";
import { Card, Stepper, Stack, Divider, Group } from "@mantine/core";
import WizardNavigation from "../../common/WizardNavigation";

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
  data: Record<string, unknown>;
  analyses: Record<string, unknown>;
  type: string;
  id?: string;
};

export type WizardStep<B extends WizardBag = WizardBag> = {
  label: string;
  render: (ctx: WizardCtx<B>) => React.ReactNode;
};

type Props<B extends WizardBag = WizardBag, R = unknown> = {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
  analyses?: Record<string, unknown>;
  defaultDatasetKey?: string;
  datasetFilter?: (item: any) => boolean;
  steps: WizardStep<B>[];
  buildResult: (ctx: WizardCtx<B>) => R;
  validateNext?: (ctx: WizardCtx<B>, stepIndex: number) => boolean;
  onFinish?: (type: string, result: R, id?: string) => void;
  onRemove?: (id?: string) => void;
  disableDataset?: boolean;
};

type ComponentLike = {
  id?: string;
  key?: string;
  name?: string;
  type?: string;
};

function toTypeKey(x: unknown): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    const o = x as ComponentLike;
    return o.id ?? o.key ?? o.name ?? o.type ?? "";
  }
  return "";
}

export default function WizardRunner<B extends WizardBag = WizardBag, R = unknown>(
  props: Props<B, R>
) {
  const {
    id,
    data = {},
    analyses = {},
    defaultDatasetKey = "Discharge",
    steps = [],
    buildResult,
    validateNext,
    onFinish,
    onRemove,
    disableDataset = false,
  } = props;

  const rawType = props.type ?? "";
  const typeKey = toTypeKey(rawType);

  const rawDatasetList = (data?.[defaultDatasetKey] as DatasetItem[] | undefined) ?? [];
  const datasetList = props.datasetFilter ? rawDatasetList.filter(props.datasetFilter) : rawDatasetList;
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [bag, setBag] = useState<B>({} as B);

  useEffect(() => {
    if (!disableDataset && datasetList.length > 0 && !selectedDataset) {
      setSelectedDataset(datasetList[0].name);
    }
  }, [datasetList, selectedDataset, disableDataset]);

  useEffect(() => {
    if (!disableDataset && datasetList.length > 0 && selectedDataset) {
      const found = datasetList.find((d) => d.name === selectedDataset);
      setDescription((prev) => (prev ? prev : found?.description || ""));
    }
  }, [selectedDataset, datasetList, disableDataset]);

  useEffect(() => {
    if (disableDataset) return;

    if (datasetList.length === 0) {
      if (selectedDataset)setSelectedDataset("")
      return;
    }

    if (!selectedDataset) setSelectedDataset(datasetList[0].name);
  }, [datasetList, selectedDataset, disableDataset]);

  const currentIndex = Math.max(0, Math.min(step - 1, steps.length - 1));
  const current = steps[currentIndex];

  const ctx: WizardCtx<B> = useMemo(
    () => ({
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
      data,
      analyses,
      type: typeKey,
      id,
    }),
    [
      step,
      name,
      description,
      selectedDataset,
      datasetList,
      bag,
      data,
      analyses,
      typeKey,
      id,
    ]
  );

  const disableNext = useMemo(() => {
    if (!validateNext) return false;
    return !validateNext(ctx, currentIndex);
  }, [ctx, currentIndex, validateNext]);

  function handleFinish() {
    const result = buildResult(ctx);
    if (typeof onFinish === "function") {
      onFinish(typeKey, result, id);
    }
    if (typeof onRemove === "function") {
      onRemove(id);
    }
  }

  return (
    <Card withBorder radius="md" padding="sm" className="wizardFrame">
      <Stack gap="sm" className="wizardStack">
        <Stepper
          active={currentIndex}
          onStepClick={(i) => {
            if (i <= currentIndex) setStep(i + 1);
          }}
          allowNextStepsSelect={false}
        >
          {steps.map((s, i) => (
            <Stepper.Step key={i} label={s.label} />
          ))}
          <Stepper.Completed>{null}</Stepper.Completed>
        </Stepper>

        <div className="wizardBody">{current?.render(ctx)}</div>

        <Group justify="space-between">
          <Divider className="wizardDivider" />
          <WizardNavigation
            step={step}
            setStep={setStep}
            numSteps={steps.length}
            onFinish={handleFinish}
            disableNext={disableNext}
            onCancel={() => onRemove?.(id)}
            finishLabel={undefined}
          />
        </Group>
      </Stack>
    </Card>
  );
}
