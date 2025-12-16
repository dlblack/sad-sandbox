import hec.heclib.dss.HecDss;
import hec.io.TimeSeriesContainer;
import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class DssWriter {

    /**
     * JSON stdin:
     * {
     *   "pathname": "/A/B/C/D/E/F/",
     *   "values": [ ... ],
     *   "startDateTime": "...",
     *   "interval": "15Minute" | "1Day" | "IR-Century" | ...,
     *   "times": [ ... ] // optional; when interval is IR-* we treat these as HEC Julian days
     * }
     *
     * For IR-* intervals:
     * - Treat as irregular: tsc.interval = 0
     * - times[] expected to be HEC Julian days (days since 31Dec1899 00:00 UTC)
     * - Convert days -> minutes for DSS container times
     */
    public static void main(String[] args) throws Exception {
        System.out.println("JAVA DEBUG: DssWriter started, args = " + java.util.Arrays.toString(args));

        if (args.length < 1) {
            System.err.println("Usage: java DssWriter <output.dss>");
            System.exit(1);
        }

        byte[] inputBytes = System.in.readAllBytes();
        String inputStr = new String(inputBytes, StandardCharsets.UTF_8);
        JSONObject json = new JSONObject(inputStr);

        String pathname = json.optString("pathname", null);
        JSONArray valuesArr = json.optJSONArray("values");
        JSONArray timesArr = json.optJSONArray("times");
        String startDateTimeStr = json.optString("startDateTime", null);
        String intervalStr = json.optString("interval", null);
        String valueType = json.optString("valueType", "PER-AVER");
        String units = json.optString("units", "CFS");

        if (pathname == null || pathname.isEmpty()) {
            System.err.println("JAVA ERROR: Missing pathname in JSON");
            System.exit(2);
        }
        if (valuesArr == null) {
            System.err.println("JAVA ERROR: Missing values array in JSON");
            System.exit(2);
        }
        if (intervalStr == null || intervalStr.isEmpty()) {
            System.err.println("JAVA ERROR: Missing interval in JSON");
            System.exit(2);
        }
        if (valuesArr.length() == 0) {
            System.out.println("JAVA DEBUG: No values to write; exiting.");
            System.exit(0);
        }

        double[] values = new double[valuesArr.length()];
        for (int i = 0; i < values.length; i++) {
            values[i] = valuesArr.getDouble(i);
        }

        boolean hasTimes = timesArr != null && timesArr.length() == values.length;
        String intervalLower = intervalStr.trim().toLowerCase();
        boolean isIrregular = intervalLower.startsWith("ir");
        boolean useProvidedTimes = hasTimes && isIrregular;

        // DSS epoch: 31Dec1899 00:00 UTC
        SimpleDateFormat baseSdf = new SimpleDateFormat("ddMMMyyyy HH:mm");
        baseSdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        long dssBaseMillis = baseSdf.parse("31Dec1899 00:00").getTime();

        int[] times = new int[values.length];
        int containerIntervalMinutes;

        if (useProvidedTimes) {
            // Provided times are HEC Julian days since DSS epoch. Convert days -> minutes.
            for (int i = 0; i < values.length; i++) {
                double julianDays = timesArr.getDouble(i);
                long minutes = Math.round(julianDays * 1440.0);
                times[i] = (int) minutes;
            }
            containerIntervalMinutes = 0; // irregular series
        } else {
            // Regular series mode (daily/instantaneous)
            if (startDateTimeStr == null || startDateTimeStr.isEmpty()) {
                System.err.println("JAVA ERROR: Missing startDateTime in JSON");
                System.exit(2);
            }

            Date startDate = parseUtcDate(startDateTimeStr);
            int minutesInterval = getMinutesInterval(intervalStr);

            for (int i = 0; i < values.length; i++) {
                long millis = startDate.getTime() + (long) i * minutesInterval * 60_000L;
                times[i] = (int) ((millis - dssBaseMillis) / 60_000L);
            }

            containerIntervalMinutes = minutesInterval;
        }

        String dssPath = args[0];
        System.out.println("JAVA DEBUG: Will write to DSS file: " + dssPath);

        HecDss dss = HecDss.open(dssPath);

        TimeSeriesContainer tsc = new TimeSeriesContainer();
        tsc.fullName = pathname;
        tsc.values = values;
        tsc.times = times;
        tsc.numberValues = values.length;
        tsc.units = (units != null && !units.isEmpty()) ? units : "CFS";
        tsc.type = (valueType != null && !valueType.isEmpty()) ? valueType : "PER-AVER";
        tsc.interval = containerIntervalMinutes;

        dss.put(tsc);
        dss.done();

        System.out.println("JAVA DEBUG: Finished writing DSS file.");
    }

    private static Date parseUtcDate(String startDateTimeStr) throws Exception {
        Exception lastEx = null;
        String[] dateFormats = new String[] {
                "ddMMMyyyy HH:mm",
                "yyyy-MM-dd HH:mm",
                "MM/dd/yyyy HH:mm",
                "yyyy-MM-dd'T'HH:mm",
                "yyyy-MM-dd'T'HH:mmX",
                "yyyy-MM-dd'T'HH:mm'Z'",
                "yyyy-MM-dd'T'HH:mm:ssX",
                "yyyy-MM-dd'T'HH:mm:ss'Z'",
                "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
        };

        for (String fmt : dateFormats) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(fmt);
                sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date d = sdf.parse(startDateTimeStr);
                if (d != null) return d;
            } catch (Exception ex) {
                lastEx = ex;
            }
        }

        if (lastEx != null) throw lastEx;
        throw new IllegalArgumentException("Failed to parse startDateTimeStr: " + startDateTimeStr);
    }

    private static int getMinutesInterval(String intervalStr) {
        String val = (intervalStr != null) ? intervalStr.trim().toLowerCase() : "";
        if (val.contains("minute") || val.contains("min")) return extractInt(val);
        if (val.contains("hour")) return extractInt(val) * 60;
        if (val.contains("day")) return extractInt(val) * 1440;
        if (val.contains("month")) return extractInt(val) * 43200;
        if (val.contains("year")) return extractInt(val) * 525600;
        return 60;
    }

    private static int extractInt(String s) {
        String digits = s.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return 1;
        return Integer.parseInt(digits);
    }
}
