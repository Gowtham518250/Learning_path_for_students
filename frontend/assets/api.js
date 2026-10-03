(() => {
  const API = (window.CAREERGRAPH_CONFIG || {}).API_BASE_URL || "http://localhost:8000";
  let accessToken = sessionStorage.getItem("careergraph_access") || "";

  async function refresh() {
    const r = await fetch(API + "/api/auth/refresh", {method:"POST", credentials:"include"});
    if (!r.ok) throw new Error("Session expired");
    const data = await r.json();
    accessToken = data.access_token;
    sessionStorage.setItem("careergraph_access", accessToken);
    return data;
  }

  async function request(path, options = {}, retry = true) {
    const headers = new Headers(options.headers || {});
    if (accessToken) headers.set("Authorization", "Bearer " + accessToken);
    if (!(options.body instanceof FormData) && options.body !== undefined) headers.set("Content-Type", "application/json");
    const r = await fetch(API + path, {...options, headers, credentials:"include"});
    if (r.status === 401 && retry && !path.includes("/auth/refresh")) {
      try { await refresh(); return request(path, options, false); } catch (_) {}
    }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.detail || data.message || "Request failed");
    return data;
  }

  window.CareerGraphAPI = {
    API,
    get token(){ return accessToken; },
    register: p => request("/api/auth/register",{method:"POST",body:JSON.stringify(p)}),
    login: async p => { const d=await request("/api/auth/login",{method:"POST",body:JSON.stringify(p)}); accessToken=d.access_token; sessionStorage.setItem("careergraph_access",accessToken); return d; },
    logout: async () => { try { await request("/api/auth/logout",{method:"POST"}); } finally { accessToken=""; sessionStorage.removeItem("careergraph_access"); } },
    me: () => request("/api/auth/me"),
    verify: token => request("/api/auth/verify-email",{method:"POST",body:JSON.stringify({token})}),
    forgotPassword: email => request("/api/auth/forgot-password",{method:"POST",body:JSON.stringify({email})}),
    resetPassword: (token,new_password) => request("/api/auth/reset-password",{method:"POST",body:JSON.stringify({token,new_password})}),
    changePassword: (current_password,new_password) => request("/api/auth/change-password",{method:"POST",body:JSON.stringify({current_password,new_password})}),
    careers: () => request("/api/careers"),
    analyze: payload => request("/api/analyze",{method:"POST",body:JSON.stringify(payload)}),
    uploadEvidence: file => { const fd=new FormData(); fd.append("file",file); return request("/api/evidence",{method:"POST",body:fd}); },
    evidence: () => request("/api/evidence")
  };
})();
