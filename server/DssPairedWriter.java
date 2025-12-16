import hec.heclib.dss.HecDss;
import hec.io.PairedDataContainer;
import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;

public class DssPairedWriter {
    public static void main(String[] args) throws Exception {
        System.out.println("JAVA PAIRED DEBUG: DssPairedWriter started, args = " + java.util.Arrays.toString(args));

        if (args.length < 1) {
            System.err.println("Usage: java DssPairedWriter <output.dss>");
            System.exit(1);
        }

        byte[] stdinBytes = System.in.readAllBytes();
        String jsonStr = new String(stdinBytes, StandardCharsets.UTF_8);
        JSONObject json = new JSONObject(jsonStr);

        String pathname = json.optString("pathname", null);
        String xLabel = json.optString("xLabel", "");
        String yLabel = json.optString("yLabel", "");
        String xUnits = json.optString("xUnits", "");
        String yUnits = json.optString("yUnits", "");

        JSONArray xValuesArr = json.optJSONArray("xValues");
        JSONArray yValuesArr = json.optJSONArray("yValues");

        if (pathname == null || pathname.isEmpty()) {
            System.err.println("JAVA PAIRED ERROR: Missing pathname in JSON");
            System.exit(2);
        }
        if (xValuesArr == null || yValuesArr == null) {
            System.err.println("JAVA PAIRED ERROR: Missing xValues or yValues in JSON");
            System.exit(2);
        }
        if (xValuesArr.length() == 0 || yValuesArr.length() == 0 || xValuesArr.length() != yValuesArr.length()) {
            System.err.println("JAVA PAIRED ERROR: Mismatched xValues/yValues lengths");
            System.exit(2);
        }

        int n = xValuesArr.length();
        double[] xVals = new double[n];
        double[][] yVals = new double[1][n];

        for (int i = 0; i < n; i++) {
            xVals[i] = xValuesArr.getDouble(i);
            yVals[0][i] = yValuesArr.getDouble(i);
        }

        String dssPath = args[0];

        HecDss dss = HecDss.open(dssPath);
        PairedDataContainer pdc = new PairedDataContainer();

        pdc.fullName = pathname;
        pdc.numberOrdinates = n;
        pdc.numberCurves = 1;
        pdc.xOrdinates = xVals;
        pdc.yOrdinates = yVals;
        pdc.xparameter = xLabel;
        pdc.yparameter = yLabel;
        pdc.xunits = xUnits;
        pdc.yunits = yUnits;

        dss.put(pdc);
        dss.done();

        System.out.println("JAVA PAIRED DEBUG: Finished writing DSS paired file.");
    }
}
