

import {
  createEnrollmentJwt,
  createNewKeyPair,
  unpackEnrollmentToken,
} from "./util/token-util.js";
import { postEnrollComplete } from "./util/http-util.js";

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(location.search);

  const tokenEl = getById<HTMLInputElement>("token");
  const contextEl = getById<HTMLInputElement>("context");
  const iamUrlEl = getById<HTMLInputElement>("iam-url");
  const outEl = getById<HTMLInputElement>("out");
  const createJwkBtn = getById<HTMLInputElement>("createJwkBtn");
  const enrollBtn = getById<HTMLInputElement>("enrollBtn");

  tokenEl.value = qs.get("token") ?? "";
  contextEl.value = qs.get("context") ?? "";
  iamUrlEl.value = qs.get("url") ?? "http://localhost:8080/realms/OCP/push-mfa/enroll/complete";

  createJwkBtn.addEventListener("click", async () => {
    await createNewKeyPair();
  });

  enrollBtn.addEventListener("click", async () => {
    const _token = tokenEl.value.trim();
    const _context = contextEl.value.trim();
    let _iamUrl: string | URL = iamUrlEl.value.trim();
    if (!_token) {
      outEl.textContent = "Please enter token.";
      return;
    }
    if(_iamUrl){
        try{
            _iamUrl = new URL(_iamUrl);
        } catch(e){
            outEl.textContent = "Not a valid url.";
            return;
        }
    }

    outEl.textContent = "Starting enrollment...";
    try {
      const enrollmentValues = unpackEnrollmentToken(_token);
      if (enrollmentValues === null) {
        outEl.textContent = "invalid enrollment token payload";
        return;
      }
      const enrollmentJwt = await createEnrollmentJwt(
        enrollmentValues,
        _context,
      );
      const keycloakResponse = await postEnrollComplete(enrollmentJwt, _iamUrl as URL);

      if (!keycloakResponse.ok) {
        const keycloakError = await keycloakResponse.text();
        outEl.textContent = "KeycloakError: " + keycloakError;
        return;
      }
      const data = await keycloakResponse.text();
      outEl.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      outEl.textContent =
        "Error: " + (e instanceof Error ? e.message : String(e));
    }
  });
});

function getById<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element mit ID "${id}" nicht gefunden`);
  }
  return el as T;
}
