function MetadataSection({
  datasetName, setDatasetName, description, setDescription, studyDssFile, setStudyDssFile
}) {
  return (
    <div className="manual-entry-metadata p-3 border rounded w-100">
      <div className="row mb-2 align-items-center justify-content-between" style={{ maxWidth: 800, margin: "0 auto" }}>
        <label htmlFor="meta-name" className="col-auto form-label font-xs" style={{ minWidth: 130 }}>
          Name
        </label>
        <div className="col-auto d-flex justify-content-end" style={{ flex: 1 }}>
          <input
            id="meta-name"
            className="form-control form-control-sm"
            value={datasetName}
            onChange={e => setDatasetName(e.target.value)}
            placeholder="Dataset name"
          />
        </div>
      </div>
      <div className="row mb-2 align-items-center justify-content-between" style={{ maxWidth: 800, margin: "0 auto" }}>
        <label htmlFor="meta-description" className="col-auto form-label font-xs" style={{ minWidth: 130 }}>
          Description
        </label>
        <div className="col-auto d-flex justify-content-end" style={{ flex: 1 }}>
          <input
            id="meta-description"
            className="form-control form-control-sm"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>
      </div>
      <div className="row align-items-center justify-content-between" style={{ maxWidth: 800, margin: "0 auto" }}>
        <label htmlFor="meta-dss" className="col-auto form-label font-xs" style={{ minWidth: 130 }}>
          Study DSS File
        </label>
        <div className="col-auto d-flex justify-content-end" style={{ flex: 1 }}>
          <input
            id="meta-dss"
            className="form-control form-control-sm"
            value={studyDssFile}
            onChange={e => setStudyDssFile(e.target.value)}
            placeholder="Study DSS File"
          />
        </div>
      </div>
    </div>
  )
}

export default MetadataSection;
