import React from "react";
import ComponentMessage from "../ComponentMessage";

interface SouthZoneProps {
    messages?: any[];
    onRemove: () => void;
}

export default function SouthZoneComponents({
                                                messages = [],
                                                onRemove,
                                            }: SouthZoneProps) {
    return (
        <div className="wizard-workspace">
            <div className="wizard-tab-body">
                <ComponentMessage messages={messages} onRemove={onRemove} />
            </div>
        </div>
    );
}
