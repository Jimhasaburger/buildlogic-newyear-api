import express from "express";

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
  const now = new Date();

  // Convert to Berlin time (UTC+1)
  const berlinOffset = now.getTimezoneOffset() * 60000;
  const utc = now.getTime() + berlinOffset;
  const berlinTime = new Date(utc + 3600000 * 1);

  // Next year midnight
  const nextYear = berlinTime.getFullYear() + 1;
  const target = new Date(`${nextYear}-01-01T00:00:00+01:00`);
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
