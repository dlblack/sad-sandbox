import hec.heclib.dss.HecDss;
import hec.io.TimeSeriesContainer;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class DssWriter {
    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: java DssWriter <input.json> <output.dss>");
            System.exit(1);
        }
        String jsonStr = new String(Files.readAllBytes(Paths.get(args[0])));
        JSONObject json = new JSONObject(jsonStr);

        String pathname = json.getString("pathname");
        JSONArray valuesArr = json.getJSONArray("values");
        String startDateTimeStr = json.getString("startDateTime");
        String intervalStr = json.getString("interval");

        double[] values = new double[valuesArr.length()];
        for (int i = 0; i < valuesArr.length(); i++)
            values[i] = valuesArr.getDouble(i);

        // --- Parse the start date/time ---
        // Assume format "ddMMMyyyy HH:mm", e.g. "01Jan2000 00:00"
        SimpleDateFormat sdf = new SimpleDateFormat("ddMMMyyyy HH:mm");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC")); // DSS uses GMT/UTC
        Date startDate = sdf.parse(startDateTimeStr);

        // --- Parse the interval ---
        int minutesInterval = getMinutesInterval(intervalStr);

        // --- Generate DSS "times" array (minutes since 31Dec1899 24:00) ---
        // DSS base date: 31Dec1899 24:00 == 01Jan1900 00:00 GMT
        long dssBase = sdf.parse("31Dec1899 24:00").getTime();
        int[] times = new int[values.length];
        for (int i = 0; i < values.length; i++) {
            long millis = startDate.getTime() + (long)i * minutesInterval * 60_000L;
            times[i] = (int)((millis - dssBase) / 60_000L); // minutes since base
        }

        String dssPath = args[1];
        HecDss dss = HecDss.open(dssPath);

        TimeSeriesContainer tsc = new TimeSeriesContainer();
        tsc.fullName = pathname;
        tsc.values = values;
        tsc.times = times;
        tsc.numberValues = values.length;
        tsc.units = "CFS"; // Set as needed or add as field in JSON
        tsc.type = "PER-AVER"; // Set as needed or add as field in JSON

        dss.put(tsc);
        dss.done();
    }

    // Converts "1Hour", "1Day", etc. to number of minutes
    private static int getMinutesInterval(String intervalStr) {
        String val = intervalStr.trim().toLowerCase();
        if (val.contains("hour"))
            return Integer.parseInt(val.replace("hour", "").replaceAll("[^0-9]", "")) * 60;
        if (val.contains("day"))
            return Integer.parseInt(val.replace("day", "").replaceAll("[^0-9]", "")) * 1440;
        if (val.contains("min"))
            return Integer.parseInt(val.replace("min", "").replaceAll("[^0-9]", ""));
        if (val.contains("month")) // 1 month ≈ 43200 min (approx, not for real data!)
            return Integer.parseInt(val.replace("month", "").replaceAll("[^0-9]", "")) * 43200;
        if (val.contains("year"))
            return Integer.parseInt(val.replace("year", "").replaceAll("[^0-9]", "")) * 525600;
        // fallback: 60 min
        return 60;
    }
}
