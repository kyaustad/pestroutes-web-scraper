"use server";

import fetch from "node-fetch";
import * as tough from "tough-cookie";
import fetchCookie from "fetch-cookie";

interface FetchParams {
  company: string;
  username: string;
  password: string;
}

export async function fetchKnockingReport({
  company,
  username,
  password,
}: FetchParams) {
  const BASE_URL = `https://${company}.pestroutes.com`;
  const LOGIN_URL = `${BASE_URL}/resources/session/login.php`;
  const DOOR_URL = `${BASE_URL}/resources/routers/doorRouter`;
  const REDIRECT =
    "/resources/delegates/day/appointmentDelegate?action=getAppointmentData";

  const jar = new tough.CookieJar();
  const cookieFetch = fetchCookie(fetch, jar);

  //  Login
  const loginBody = new URLSearchParams({
    username,
    password,
    company,
    redirect: REDIRECT,
  });
  const loginRes = await cookieFetch(LOGIN_URL, {
    method: "POST",
    body: loginBody,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Origin: BASE_URL,
      Referer: BASE_URL,
    },
  });
  const loginData = await loginRes.json();
  if (!(loginData as any).redirect) throw new Error("Login failed");

  //  Get Pendo visitor ID
  const salesRes = await cookieFetch(`${BASE_URL}/sales`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await salesRes.text();
  const match = html.match(
    /pendo\.initialize\(\s*\{\s*visitor:\s*\{\s*id:\s*"([^"]+)"/m
  );
  if (!match) throw new Error("Could not find Pendo visitor ID");
  const employeeId = match[1].split("-")[1];

  //  Fetch knocking report CSV
  const form = new URLSearchParams({
    "dateRange-officeParams": "01/01/2025 - 12/31/2025",
    persistedDateRange: "01/01/2025-12/31/2025",
    employees: employeeId,
    officeIDs: "1",
    advanceToggle: "false",
    sortColumn: "doorID",
    sortDirection: "asc",
    action: "exportReport",
  });

  const reportRes = await cookieFetch(DOOR_URL, {
    method: "POST",
    body: form,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!reportRes.ok) throw new Error(`Export failed: ${reportRes.status}`);
  const csvText = await reportRes.text();

  // Convert CSV to 2D array
  return csvText.split("\n").map((row) => row.split(","));
}
