import DataTypeComboBox from "../editor_components/combo_boxes/DataTypeComboBox";
import ParameterComboBox from "../editor_components/combo_boxes/ParameterComboBox";
import DataUnitComboBox from "../editor_components/combo_boxes/DataUnitComboBox";
import DataIntervalComboBox from "../editor_components/combo_boxes/DataIntervalComboBox";

function FieldsSection({ dataType, setDataType, parameter, setParameter, dataUnit, setDataUnit, dataInterval, setDataInterval }) {
  return (
    <div className="manual-entry-fields-left card-text flex-grow-1 d-flex flex-column p-3">
      <div className="form-group row align-items-center mb-2">
        <label htmlFor="dataType" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>Data Type:</label>
        <div className="col ps-0">
          <DataTypeComboBox value={dataType} onChange={setDataType} id="dataType" />
        </div>
      </div>
      <div className="form-group row align-items-center mb-2">
        <label htmlFor="parameter" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>Parameter:</label>
        <div className="col ps-0">
          <ParameterComboBox value={parameter} onChange={setParameter} id="parameter" />
        </div>
      </div>
      <div className="form-group row align-items-center mb-2">
        <label htmlFor="dataUnit" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>Data Unit:</label>
        <div className="col ps-0">
          <DataUnitComboBox parameter={parameter} value={dataUnit} onChange={setDataUnit} id="dataUnit" />
        </div>
      </div>
      <div className="form-group row align-items-center mb-2">
        <label htmlFor="dataInterval" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>Data Interval:</label>
        <div className="col ps-0">
          <DataIntervalComboBox value={dataInterval} onChange={setDataInterval} id="dataInterval" />
        </div>
      </div>
    </div>
  );
}

export default FieldsSection;
