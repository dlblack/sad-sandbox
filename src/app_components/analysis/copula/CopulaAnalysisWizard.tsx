import React from "react";
import WizardRunner from "../components/WizardRunner";
import {
    makeWizardGeneralInfoStep,
} from "../components/steps/WizardGeneralInfo";

import makeScenariosStep from "./CopulaScenariosStep";
import makeMarginalDistributionsStep from "./CopulaMarginalDistributionsStep";
import makeContourProbabilitiesStep from "./CopulaContourProbabilitiesStep";
import makeCopulaSelectionStep from "./CopulaSelectionStep";
import makeDesignEventsStep from "./CopulaDesignEventsStep";
import makeConditionalSimulationsStep from "./CopulaConditionalSimulationsStep";

export interface CopulaAnalysisWizardProps {
    [key: string]: unknown;
}

export default function CopulaAnalysisWizard(props: CopulaAnalysisWizardProps) {
    const steps = [
        makeWizardGeneralInfoStep({ includeDataset: false }),
        makeScenariosStep(),
        makeMarginalDistributionsStep(),
        makeContourProbabilitiesStep(),
        makeCopulaSelectionStep(),
        makeDesignEventsStep(),
        makeConditionalSimulationsStep(),
    ];

    const buildResult = (ctx: any) => ({
        name: ctx.name,
        description: ctx.description,
    });

    return (
        <WizardRunner
            {...props}
            steps={steps}
            buildResult={buildResult}
            disableDataset
        />
    );
}
