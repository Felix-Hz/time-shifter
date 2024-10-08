import { DateTime } from "luxon";
import timeZones from "./tz-lookup.json";

document.addEventListener("DOMContentLoaded", () => {
  populateTimeZoneDropdowns();
  setDefaultDateTime();

  const form = document.getElementById("convert-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const datetime = document.getElementById("datetime").value;
      const fromTz = document.getElementById("from-tz").value;
      const toTz = document.getElementById("to-tz").value;

      try {
        const { isoDate, humanReadableDate } = convertTimeZone(
          datetime,
          fromTz,
          toTz
        );

        document.getElementById("converted-time").textContent =
          humanReadableDate;
        document.getElementById("result").classList.remove("hidden");

        const calendarLink = generateGoogleCalendarLink(isoDate);
        document.getElementById("calendar-link").href = calendarLink;
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please check your input and try again.");
      }
    });
  } else {
    console.error("Popup form not found.");
  }
});

function populateTimeZoneDropdowns() {
  const fromTzSelect = document.getElementById("from-tz");
  const toTzSelect = document.getElementById("to-tz");

  Object.entries(timeZones.timeZones).forEach(([label, zone]) => {
    const option = document.createElement("option");
    option.value = zone;
    option.textContent = label;
    fromTzSelect.appendChild(option.cloneNode(true));
    toTzSelect.appendChild(option);
  });
}

function setDefaultDateTime() {
  const datetimeInput = document.getElementById("datetime");
  const now = DateTime.local();
  const formattedDateTime = now.toFormat("yyyy-MM-dd'T'HH:mm");
  datetimeInput.value = formattedDateTime;
}

function convertTimeZone(datetime, fromTz, toTz) {
  const dt = DateTime.fromISO(datetime, { zone: fromTz });
  const converted = dt.setZone(toTz);
  return {
    isoDate: converted.toISO(),
    humanReadableDate: converted.toLocaleString(DateTime.DATETIME_MED),
  };
}

function generateGoogleCalendarLink(convertedTime) {
  const baseUrl = "https://calendar.google.com/calendar/r/eventedit?";
  const params = new URLSearchParams({
    dates: `${formatGoogleCalendarDate(
      convertedTime
    )}/${formatGoogleCalendarDate(convertedTime)}`,
    text: "New Event",
    location: "",
    details: "Generated by TimeShifter",
  });

  return baseUrl + params.toString();
}

function formatGoogleCalendarDate(dateStr) {
  const date = DateTime.fromISO(dateStr);
  return date.toISO().replace(/-|:|\.\d+/g, "");
}
