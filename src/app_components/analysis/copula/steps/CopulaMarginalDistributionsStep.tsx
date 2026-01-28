import React, { useState, useMemo } from "react";
import { Box, Text, Stack, Select, NumberInput, SimpleGrid, Card, ScrollArea } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep, WizardCtx } from "../../_shared/WizardRunner";

type ConditioningDistType = "GEV" | "LPIII";
type NonConditioningDistType = "NORMAL" | "LOGN" | "LOG10N" | "LPIII" | "GPARETO" | "EMPIRICAL";

type ScenarioMarginals = {
  scenarioName: string;
  conditioningDataset: string | null;
  nonConditioningDataset: string | null;

  conditioningDistribution: ConditioningDistType;
  conditioningLocation?: number;
  conditioningScale?: number;
  conditioningShape?: number;
  conditioningMean?: number;
  conditioningStdDev?: number;
  conditioningSkew?: number;

  nonConditioningDistribution: NonConditioningDistType;
  nonConditioningLocation?: number;
  nonConditioningScale?: number;
  nonConditioningShape?: number;
  nonConditioningMean?: number;
  nonConditioningStdDev?: number;
  nonConditioningSkew?: number;
};

function MarginalDistributionsPanel({ bag, setBag }: Pick<WizardCtx, "bag" | "setBag">) {
  const scenariosFromBag = useMemo(() => {
    const scenarios = (bag as any)?.scenarios || [];
    return Array.isArray(scenarios) ? scenarios : [];
  }, [bag]);

  const [marginals, setMarginals] = useState<ScenarioMarginals[]>(() => {
    return scenariosFromBag.map((scenario: any) => ({
      scenarioName: scenario.name || "",
      conditioningDataset: scenario.conditioningDataset || null,
      nonConditioningDataset: scenario.nonConditionedDataset || null,
      conditioningDistribution: "GEV" as ConditioningDistType,
      nonConditioningDistribution: "NORMAL" as NonConditioningDistType,
    }));
  });

  const updateMarginal = (index: number, updates: Partial<ScenarioMarginals>) => {
    setMarginals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });

    setBag((prev: any) => ({
      ...prev,
      marginalDistributions: marginals,
    }));
  };

  const conditioningDistOptions = [
    { value: "GEV", label: TextStore.interface("Copula_Wizard_StepMarginalDist_GEV") },
    { value: "LPIII", label: TextStore.interface("Copula_Wizard_StepMarginalDist_LPIII") },
  ];

  const nonConditioningDistOptions = [
    { value: "LOG10N", label: TextStore.interface("Copula_Wizard_StepMarginalDist_LOGN10") },
    { value: "LOGN", label: TextStore.interface("Copula_Wizard_StepMarginalDist_LOGN") },
    { value: "NORMAL", label: TextStore.interface("Copula_Wizard_StepMarginalDist_Normal") },
    { value: "GPARETO", label: TextStore.interface("Copula_Wizard_StepMarginalDist_GenPar") },
    { value: "LPIII", label: TextStore.interface("Copula_Wizard_StepMarginalDist_LPIII") },
    { value: "EMPIRICAL", label: TextStore.interface("Copula_Wizard_StepMarginalDist_Emp") },
  ];

  return (
    <Stack gap="md" className="copula-marginaldistributions-stack">
      <Text size="sm">
        {TextStore.interface("Copula_Wizard_StepMarginalDist_Label")}
      </Text>

      <ScrollArea
        className="copula-marginaldistributions-scrollarea"
        type="auto"
      >
        <SimpleGrid
          className="copula-marginaldistributions-simplegrid"
          cols={2}
          spacing="md"
        >
          {marginals.map((marginal, index) => {
            const condDist = marginal.conditioningDistribution;
            const nonCondDist = marginal.nonConditioningDistribution;

            return (
              <Card key={index} withBorder radius="md" padding="md">
                <Stack gap="md">
                  <Text fw={600} size="md">
                    {TextStore.interface("Copula_Wizard_StepMarginalDist_Scenario_L")}{marginal.scenarioName
                    || `${TextStore.interface("Copula_Wizard_StepMarginalDist_Scenario")} ${index + 1}`}
                  </Text>

                  {/* Conditioning Variable Section */}
                  <Box>
                    <Text fw={500} mb="xs" size="sm">
                      {TextStore.interface("Copula_Wizard_StepMarginalDist_CondVarDataset_L")}{marginal.conditioningDataset}
                    </Text>

                    <Stack gap="xs">
                      <Select
                        size="xs"
                        label={TextStore.interface("Copula_Wizard_StepMarginalDist_CondVarDist_L")}
                        data={conditioningDistOptions}
                        value={condDist}
                        onChange={(value) =>
                          updateMarginal(index, {
                            conditioningDistribution: (value as ConditioningDistType) || "GEV",
                          })
                        }
                      />

                      {condDist === "GEV" && (
                        <>
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Location_L")}
                            value={marginal.conditioningLocation}
                            onChange={(value) =>
                              updateMarginal(index, {
                                conditioningLocation: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Scale_L")}
                            value={marginal.conditioningScale}
                            onChange={(value) =>
                              updateMarginal(index, {
                                conditioningScale: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Shape_L")}
                            value={marginal.conditioningShape}
                            onChange={(value) =>
                              updateMarginal(index, {
                                conditioningShape: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                        </>
                      )}

                      {condDist === "LPIII" && (
                        <>
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Mean_L")}
                            value={marginal.conditioningMean}
                            onChange={(value) =>
                              updateMarginal(index, {
                                conditioningMean: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_StdDev_L")}
                            value={marginal.conditioningStdDev}
                            onChange={(value) =>
                              updateMarginal(index, {
                                conditioningStdDev: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Skew_L")}
                            value={marginal.conditioningSkew}
                            onChange={(value) =>
                              updateMarginal(index, {
                                conditioningSkew: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                        </>
                      )}
                    </Stack>
                  </Box>

                  {/* Non-conditioning Variable Section */}
                  <Box>
                    <Text fw={500} mb="xs" size="sm">
                      {TextStore.interface("Copula_Wizard_StepMarginalDist_NonCondVarDataset_L")}{marginal.nonConditioningDataset}
                    </Text>

                    <Stack gap="xs">
                      <Select
                        size="xs"
                        label={TextStore.interface("Copula_Wizard_StepMarginalDist_NonCondVarDist_L")}
                        data={nonConditioningDistOptions}
                        value={nonCondDist}
                        onChange={(value) =>
                          updateMarginal(index, {
                            nonConditioningDistribution: (value as NonConditioningDistType) || "NORMAL",
                          })
                        }
                      />

                      {(nonCondDist === "NORMAL" || nonCondDist === "LOGN" || nonCondDist === "LOG10N") && (
                        <>
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Mean_L")}
                            value={marginal.nonConditioningMean}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningMean: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_StdDev_L")}
                            value={marginal.nonConditioningStdDev}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningStdDev: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                        </>
                      )}

                      {nonCondDist === "LPIII" && (
                        <>
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Mean_L")}
                            value={marginal.nonConditioningMean}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningMean: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_StdDev_L")}
                            value={marginal.nonConditioningStdDev}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningStdDev: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Skew_L")}
                            value={marginal.nonConditioningSkew}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningSkew: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                        </>
                      )}

                      {nonCondDist === "GPARETO" && (
                        <>
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Location_L")}
                            value={marginal.nonConditioningLocation}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningLocation: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Scale_L")}
                            value={marginal.nonConditioningScale}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningScale: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                          <NumberInput
                            size="xs"
                            label={TextStore.interface("Copula_Wizard_StepMarginalDist_Shape_L")}
                            value={marginal.nonConditioningShape}
                            onChange={(value) =>
                              updateMarginal(index, {
                                nonConditioningShape: typeof value === "number" ? value : undefined,
                              })
                            }
                          />
                        </>
                      )}

                      {nonCondDist === "EMPIRICAL" && (
                        <Text size="sm" c="dimmed">
                          No additional parameters required for Empirical distribution.
                        </Text>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </ScrollArea>
    </Stack>
  );
}

export default function makeMarginalDistributionsStep(): WizardStep {
  return {
    label: TextStore.interface("Copula_Wizard_StepMarginalDist"),
    render: (ctx: WizardCtx) => (
      <Box p="sm" style={{ height: "100%" }}>
        <MarginalDistributionsPanel bag={ctx.bag} setBag={ctx.setBag} />
      </Box>
    ),
  };
}