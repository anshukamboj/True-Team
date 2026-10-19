import { api } from "./api";

// employees ka sahi route sabse upar daal do, baaki fallback hain
const ROUTES = [
  "/employees?limit=1000",
  "/users?limit=1000",
  "/auth/users?limit=1000",
  "/hr/employees?limit=1000",
];

function toList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res?.employees)) return res.employees;
  return [];
}

// dashboard aur employees page dono yahi use karte hain
export async function getEmployees() {
  for (const route of ROUTES) {
    try {
      const res = await api.get(route);
      return toList(res).filter((u) => String(u.role || "").toLowerCase() === "employee");
    } catch (err) {
      // ye route nahi mila, agla try karo
    }
  }
  throw new Error("Employees route not found");
}