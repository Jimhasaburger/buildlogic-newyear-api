import express from "express";
import { DateTime } from "luxon"; // Import luxon to handle time zone properly

const app = express();

// Pad number to N bits binary string
function padBinary(num, bits) {
  return num.toString(2).padStart(bits, "0");
}

// Convert a number 0-99 to two-digit BCD packed in 8 bits
function toTwoDigitBCD(num) {
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  return (tens << 4) | ones;
}

app.get("/newyear", (req, res) => {
  // Get Berlin time (adjusts for daylight savings automatically)
  const berlinTime = DateTime.now().setZone('Europe/Berlin'); // Use Berlin time

  // Calculate time difference to next year midnight (local Berlin time)
  const nextYear = berlinTime.year + 1;
  const target = DateTime.fromISO(`${nextYear}-01-01T00:00:00`, { zone: 'Europe/Berlin' });  // New Year's at midnight (Berlin time)
  const diff = Math.max(0, target - berlinTime);

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const header = req.query.header;

  if (header === "1") {
    const combined = toTwoDigitBCD(hours);
    return res.json({ value: padBinary(combined, 8) });
  } else if (header === "2") {
    const combined = toTwoDigitBCD(minutes);
    return res.json({ value: padBinary(combined, 8) });
  } else if (header === "3") {
    const combined = toTwoDigitBCD(seconds);
    return res.json({ value: padBinary(combined, 8) });
  } else {
    return res.status(400).json({ error: "Specify header=1, 2, or 3" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));
