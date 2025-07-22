import hec.heclib.dss.HecDss;
import hec.heclib.util.HecTime;
import hec.io.TimeSeriesContainer;
import hec.io.PairedDataContainer;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class DssReader {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"x\":[],\"y\":[],\"error\":\"Missing DSS file or pathname\"}");
            System.exit(1);
        }

        String dssFile = args[0];
        String pathname = args[1];
        HecDss dss = null;

        try {
            dss = HecDss.open(dssFile);
            Object record = dss.get(pathname, true);

            if (record instanceof TimeSeriesContainer) {
                TimeSeriesContainer tsc = (TimeSeriesContainer) record;

                if (tsc.values == null || tsc.values.length == 0) {
                    System.out.println("{\"x\":[],\"y\":[],\"error\":\"No time series data\"}");
                    System.exit(0);
                }

                // Debug log to inspect fields
                System.err.println("DSS PATH: " + pathname);
                System.err.println("PARAMETER: " + tsc.parameter);
                System.err.println("UNITS: " + tsc.units);

                double[] values = tsc.values;
                int[] times = tsc.times;

                // Extract labels explicitly
                String[] parts = pathname.split("/");
                String label = (tsc.parameter != null && !tsc.parameter.trim().isEmpty())
                        ? tsc.parameter
                        : (parts.length > 3 ? parts[3] : "Value");
                String units = (tsc.units != null && !tsc.units.trim().isEmpty())
                        ? tsc.units
                        : (parts.length > 6 ? parts[6] : "");

                System.err.println("FINAL LABEL: " + label);
                System.err.println("FINAL UNITS: " + units);

                // Format times to ISO for frontend
                SimpleDateFormat isoFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                isoFmt.setTimeZone(TimeZone.getTimeZone("UTC"));

                String[] xVals = new String[times.length];
                for (int i = 0; i < times.length; i++) {
                    HecTime ht = new HecTime();
                    ht.set(times[i]);
                    long millis = ht.getJavaDate(0).getTime();
                    xVals[i] = isoFmt.format(new Date(millis));
                }

                JSONObject json = new JSONObject();
                json.put("x", xVals);
                json.put("y", values);
                json.put("yLabel", label);
                json.put("yUnits", units);

                System.out.print(json.toString());
                System.exit(0);

            } else if (record instanceof PairedDataContainer) {
                PairedDataContainer pdc = (PairedDataContainer) record;

                if (pdc.xOrdinates == null || pdc.yOrdinates == null || pdc.yOrdinates.length == 0) {
                    System.out.println("{\"x\":[],\"y\":[],\"error\":\"No paired data\"}");
                    System.exit(0);
                }

                double[] xVals = pdc.xOrdinates;
                double[] yVals = pdc.yOrdinates[0];

                JSONObject json = new JSONObject();
                json.put("x", xVals);
                json.put("y", yVals);
                json.put("xLabel", pdc.xparameter != null ? pdc.xparameter : "X");
                json.put("xUnits", pdc.xunits != null ? pdc.xunits : "");
                json.put("yLabel", pdc.yparameter != null ? pdc.yparameter : "Y");
                json.put("yUnits", pdc.yunits != null ? pdc.yunits : "");
                System.out.print(json.toString());
                System.exit(0);
            } else {
                System.out.println("{\"x\":[],\"y\":[],\"error\":\"Unsupported DSS record type\"}");
                System.exit(0);
            }
        } catch (Exception e) {
            System.out.println("{\"x\":[],\"y\":[],\"error\":\"" + e.getMessage() + "\"}");
            System.exit(1);
        } finally {
            if (dss != null) dss.done();
        }
    }
}
