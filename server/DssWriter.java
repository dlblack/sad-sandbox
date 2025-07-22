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
        System.out.println("JAVA DEBUG: DssWriter started, args = " + java.util.Arrays.toString(args));

        if (args.length < 2) {
            System.err.println("Usage: java DssWriter <input.json> <output.dss>");
            System.exit(1);
        }

        // Read JSON
        String jsonStr = new String(Files.readAllBytes(Paths.get(args[0])));
        System.out.println("JAVA DEBUG: Read input JSON file: " + args[0]);
        System.out.println("JAVA DEBUG: Input JSON content: " + jsonStr);

        JSONObject json = new JSONObject(jsonStr);

        // Parse fields from JSON
        String pathname = json.optString("pathname", null);
        JSONArray valuesArr = json.optJSONArray("values");
        String startDateTimeStr = json.optString("startDateTime", null);
        String intervalStr = json.optString("interval", null);

        System.out.println("JAVA DEBUG: pathname = " + pathname);
        System.out.println("JAVA DEBUG: startDateTimeStr = " + startDateTimeStr);
        System.out.println("JAVA DEBUG: intervalStr = " + intervalStr);

        // Parse values
        double[] values = new double[(valuesArr != null) ? valuesArr.length() : 0];
        for (int i = 0; i < values.length; i++)
            values[i] = valuesArr.getDouble(i);

        // Log values
        System.out.print("JAVA DEBUG: values = ");
        for (double v : values) System.out.print(v + " ");
        System.out.println();

        // --- Parse the start date/time ---
        // Accepts multiple formats, so user can enter whatever
        Date startDate = null;
        Exception lastEx = null;
        String[] dateFormats = new String[] {
            "ddMMMyyyy HH:mm",
            "ddMMMyyyy HH:mm",
            "ddMMMyyyy HH:mm",
            "yyyy-MM-dd HH:mm",
            "MM/dd/yyyy HH:mm",
            "yyyy-MM-dd'T'HH:mm"
        };
        for (String fmt : dateFormats) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(fmt);
                sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                startDate = sdf.parse(startDateTimeStr);
                if (startDate != null) {
                    System.out.println("JAVA DEBUG: Parsed startDate = " + startDate + " using format " + fmt);
                    break;
                }
            } catch (Exception ex) {
                lastEx = ex;
            }
        }
        if (startDate == null) {
            System.err.println("JAVA ERROR: Failed to parse startDateTimeStr: '" + startDateTimeStr + "'");
            if (lastEx != null) lastEx.printStackTrace();
            System.exit(2);
        }

        // --- Parse the interval ---
        int minutesInterval = getMinutesInterval(intervalStr);
        System.out.println("JAVA DEBUG: minutesInterval = " + minutesInterval);

        // --- Generate DSS "times" array (minutes since 31Dec1899 24:00) ---
        SimpleDateFormat baseSdf = new SimpleDateFormat("ddMMMyyyy HH:mm");
        baseSdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        long dssBase = baseSdf.parse("31Dec1899 24:00").getTime();
        System.out.println("JAVA DEBUG: DSS base time = " + dssBase + " (" + new Date(dssBase) + ")");

        int[] times = new int[values.length];
        for (int i = 0; i < values.length; i++) {
            long millis = startDate.getTime() + (long)i * minutesInterval * 60_000L;
            times[i] = (int)((millis - dssBase) / 60_000L);
            System.out.println("JAVA DEBUG: i=" + i + " millis=" + millis + " times[i]=" + times[i] + " (" + new Date(millis) + ")");
        }

        String dssPath = args[1];
        System.out.println("JAVA DEBUG: Will write to DSS file: " + dssPath);

        HecDss dss = HecDss.open(dssPath);

        TimeSeriesContainer tsc = new TimeSeriesContainer();
        tsc.fullName = pathname;
        tsc.values = values;
        tsc.times = times;
        tsc.numberValues = values.length;
        tsc.units = "CFS";
        tsc.type = "PER-AVER";

        System.out.println("JAVA DEBUG: tsc.fullName: " + tsc.fullName);
        System.out.println("JAVA DEBUG: tsc.values.length: " + tsc.values.length);
        System.out.println("JAVA DEBUG: tsc.times[0]: " + (tsc.times.length > 0 ? tsc.times[0] : "N/A"));

        dss.put(tsc);
        dss.done();

        System.out.println("JAVA DEBUG: Finished writing DSS file.");
    }

    // Converts "1Hour", "1Day", etc. to number of minutes
    private static int getMinutesInterval(String intervalStr) {
        String val = (intervalStr != null) ? intervalStr.trim().toLowerCase() : "";
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
