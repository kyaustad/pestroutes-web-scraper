import fetch from "node-fetch"; // npm i node-fetch@2
import * as fs from "fs";
import * as tough from "tough-cookie";
import fetchCookie from "fetch-cookie";

const jar = new tough.CookieJar();
const cookieFetch = fetchCookie(fetch, jar);

const BASE_URL = "https://shrikepest.pestroutes.com";
const LOGIN_URL = `${BASE_URL}/resources/session/login.php`;
const DOOR_URL = `${BASE_URL}/resources/routers/doorRouter`;

const USERNAME = "KAustad";
const PASSWORD = "Shrike2025";
const COMPANY = "shrikepest";
const REDIRECT =
  "/resources/delegates/day/appointmentDelegate?action=getAppointmentData";

async function login() {
  const body = new URLSearchParams({
    username: USERNAME,
    password: PASSWORD,
    company: COMPANY,
    redirect: REDIRECT,
  });

  const res = await cookieFetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Origin: BASE_URL,
      Referer: BASE_URL,
    },
    body,
  });

  const data = await res.json();
  console.log("Login data:", data);
  if (!(data as any).redirect) throw new Error("Login failed");
  console.log("✅ Logged in");
}

async function getPendoVisitorId() {
  const res = await cookieFetch(BASE_URL + "/sales", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await res.text();

  // Look for pendo.initialize({...}) and extract visitor.id
  const match = html.match(
    /pendo\.initialize\(\s*\{\s*visitor:\s*\{\s*id:\s*"([^"]+)"/m
  );
  if (!match) throw new Error("Could not find Pendo visitor ID");

  const value = match[1]; // e.g. "shrikepest-10013"
  const employeeId = value.split("-")[1];

  console.log("Pendo visitor value:", value);
  console.log("Employee ID:", employeeId);
  return employeeId;
}

async function exportKnockingReport() {
  const employeeId = await getPendoVisitorId();
  const form = new URLSearchParams({
    "dateRange-officeParams": "08/01/2025 - 08/31/2025",
    persistedDateRange: "09/10/2025-09/10/2025",
    employees: employeeId,
    officeIDs: "1",
    advanceToggle: "false",
    sortColumn: "doorID",
    sortDirection: "asc",
    action: "exportReport",
  });

  const res = await cookieFetch(DOOR_URL, {
    method: "POST",
    body: form,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
    },
  });
  //   console.log("Export response:", res);

  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const csv = await res.text();

  fs.writeFileSync("knocking_report.csv", csv);
  console.log("📁 Saved knocking_report.csv");
}

(async () => {
  try {
    await login();
    await getPendoVisitorId();
    await exportKnockingReport();
  } catch (e) {
    console.error(e);
  }
})();
