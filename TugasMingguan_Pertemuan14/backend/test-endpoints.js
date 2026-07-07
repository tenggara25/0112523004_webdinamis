const API_URL = "http://localhost:3000/api";

async function test() {
  console.log("=== STARTING ENDPOINT TESTS ===\n");

  const credentials = {
    admin: { email: "admin@mail.com", password: "password123" },
    operator: { email: "operator@mail.com", password: "password123" },
    viewer: { email: "viewer@mail.com", password: "password123" },
  };

  const tokens = {};

  // 1. LOGIN TESTS
  console.log("--- 1. Login Tests ---");
  for (const [role, creds] of Object.entries(credentials)) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (res.ok) {
        tokens[role] = data.token;
        console.log(`[PASS] Login as ${role}: Status ${res.status}`);
      } else {
        console.log(`[FAIL] Login as ${role}: Status ${res.status} - ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`[ERROR] Login as ${role}: ${err.message}`);
    }
  }
  console.log();

  // Helper function for request
  async function request(path, method, role, body = null) {
    const headers = { "Content-Type": "application/json" };
    if (tokens[role]) {
      headers["Authorization"] = `Bearer ${tokens[role]}`;
    }
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_URL}${path}`, { ...options });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, data };
  }

  // 2. GET MAHASISWA TESTS
  console.log("--- 2. GET /mahasiswa (Read) ---");
  for (const role of ["viewer", "operator", "admin"]) {
    const res = await request("/mahasiswa", "GET", role);
    console.log(`[${res.status === 200 ? "PASS" : "FAIL"}] ${role.toUpperCase()}: GET /mahasiswa -> Status ${res.status}`);
  }
  console.log();

  // 3. POST MAHASISWA TESTS
  console.log("--- 3. POST /mahasiswa (Create) ---");
  const studentData = {
    nim: "9999901",
    nama: "Test Student Admin",
    prodi_id: 1,
    angkatan: 2024
  };
  const studentDataOp = {
    nim: "9999902",
    nama: "Test Student Op",
    prodi_id: 1,
    angkatan: 2024
  };

  // Viewer Create (should fail 403)
  let res = await request("/mahasiswa", "POST", "viewer", studentData);
  console.log(`[${res.status === 403 ? "PASS" : "FAIL"}] VIEWERS: POST /mahasiswa -> Status ${res.status} (Expected 403). Msg: ${res.data.message}`);

  // Operator Create (should pass 201)
  res = await request("/mahasiswa", "POST", "operator", studentDataOp);
  let createdOpId = res.data.data?.id;
  console.log(`[${res.status === 201 ? "PASS" : "FAIL"}] OPERATOR: POST /mahasiswa -> Status ${res.status} (Expected 201). Created ID: ${createdOpId}`);

  // Admin Create (should pass 201)
  res = await request("/mahasiswa", "POST", "admin", studentData);
  let createdAdminId = res.data.data?.id;
  console.log(`[${res.status === 201 ? "PASS" : "FAIL"}] ADMIN: POST /mahasiswa -> Status ${res.status} (Expected 201). Created ID: ${createdAdminId}`);
  console.log();

  // 4. PUT MAHASISWA TESTS
  console.log("--- 4. PUT /mahasiswa/:id (Update) ---");
  const updateData = {
    nim: "9999901",
    nama: "Updated Student Admin",
    prodi_id: 1,
    angkatan: 2025
  };

  // Viewer Update (should fail 403)
  res = await request(`/mahasiswa/${createdAdminId}`, "PUT", "viewer", updateData);
  console.log(`[${res.status === 403 ? "PASS" : "FAIL"}] VIEWERS: PUT /mahasiswa/${createdAdminId} -> Status ${res.status} (Expected 403). Msg: ${res.data.message}`);

  // Operator Update (should pass 200)
  res = await request(`/mahasiswa/${createdAdminId}`, "PUT", "operator", updateData);
  console.log(`[${res.status === 200 ? "PASS" : "FAIL"}] OPERATOR: PUT /mahasiswa/${createdAdminId} -> Status ${res.status} (Expected 200)`);

  // Admin Update (should pass 200)
  res = await request(`/mahasiswa/${createdAdminId}`, "PUT", "admin", updateData);
  console.log(`[${res.status === 200 ? "PASS" : "FAIL"}] ADMIN: PUT /mahasiswa/${createdAdminId} -> Status ${res.status} (Expected 200)`);
  console.log();

  // 5. DELETE MAHASISWA TESTS
  console.log("--- 5. DELETE /mahasiswa/:id (Delete) ---");

  // Viewer Delete (should fail 403)
  res = await request(`/mahasiswa/${createdAdminId}`, "DELETE", "viewer");
  console.log(`[${res.status === 403 ? "PASS" : "FAIL"}] VIEWERS: DELETE /mahasiswa/${createdAdminId} -> Status ${res.status} (Expected 403). Msg: ${res.data.message}`);

  // Operator Delete (should fail 403)
  res = await request(`/mahasiswa/${createdAdminId}`, "DELETE", "operator");
  console.log(`[${res.status === 403 ? "PASS" : "FAIL"}] OPERATOR: DELETE /mahasiswa/${createdAdminId} -> Status ${res.status} (Expected 403). Msg: ${res.data.message}`);

  // Admin Delete (should pass 200)
  res = await request(`/mahasiswa/${createdAdminId}`, "DELETE", "admin");
  console.log(`[${res.status === 200 ? "PASS" : "FAIL"}] ADMIN: DELETE /mahasiswa/${createdAdminId} -> Status ${res.status} (Expected 200)`);

  // Also cleanup the operator created student
  await request(`/mahasiswa/${createdOpId}`, "DELETE", "admin");
  console.log("\nCleanup complete.");
}

test();
