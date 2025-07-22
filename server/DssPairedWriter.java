import hec.heclib.dss.HecDss;
import hec.io.PairedDataContainer;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.file.Files;
import java.nio.file.Paths;

public class DssPairedWriter {
    public static void main(String[] args) throws Exception {
        System.out.println("JAVA DEBUG: DssPairedWriter started, args = " + java.util.Arrays.toString(args));

        if (args.length < 2) {
            System.err.println("Usage: java DssPairedWriter <input.json> <output.dss>");
            System.exit(1);
        }

        String jsonStr = new String(Files.readAllBytes(Paths.get(args[0])));
        System.out.println("JAVA DEBUG: Input JSON content: " + jsonStr);
        JSONObject json = new JSONObject(jsonStr);

        String pathname = json.optString("pathname");
        String xLabel = json.optString("xLabel");
        String yLabel = json.optString("yLabel");
        String xUnits = json.optString("xUnits");
        String yUnits = json.optString("yUnits");
        JSONArray xValuesArr = json.getJSONArray("xValues");
        JSONArray yValuesArr = json.getJSONArray("yValues");

        int n = xValuesArr.length();
        double[] xVals = new double[n];
        double[][] yVals = new double[1][n];

        for (int i = 0; i < n; i++) {
            xVals[i] = xValuesArr.getDouble(i);
            yVals[0][i] = yValuesArr.getDouble(i);
        }

        System.out.println("JAVA DEBUG: Writing " + n + " points.");

        HecDss dss = HecDss.open(args[1]);
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

        System.out.println("JAVA DEBUG: PairedData written successfully.");
    }
}
